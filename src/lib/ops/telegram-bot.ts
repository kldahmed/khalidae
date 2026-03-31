// Telegram Bot Operations Layer
import { Telegraf, Context } from 'telegraf';
import { getHealth, getProviders, getErrors, getTrace, getFallbackStatus, getCacheStatus, getCostMode, setCostMode, disableProvider, enableProvider, clearCache, resetCircuit, getDailyReport, getHourlyReport, handleExcelRequest } from './ops-backend';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_IDS = (process.env.TELEGRAM_ADMIN_IDS || '').split(',').map(id => id.trim());

if (!BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN missing');

const bot = new Telegraf(BOT_TOKEN);

function isAdmin(ctx: Context) {
  return ctx.from && ADMIN_IDS.includes(ctx.from.id.toString());
}

// --- Command Handlers ---
bot.command('health', async ctx => {
  if (!isAdmin(ctx)) return;
  const health = await getHealth();
  ctx.reply(`Health: ${health.status}\n${health.details}`);
});

bot.command('providers', async ctx => {
  if (!isAdmin(ctx)) return;
  const providers = await getProviders();
  ctx.reply(`Providers:\n${providers.map(p => `- ${p.name}: ${p.status}`).join('\n')}`);
});

bot.command('errors', async ctx => {
  if (!isAdmin(ctx)) return;
  const errors = await getErrors();
  ctx.reply(`Recent Errors:\n${errors.map(e => `- ${e.time}: ${e.message}`).join('\n')}`);
});

bot.command('trace', async ctx => {
  if (!isAdmin(ctx)) return;
  const id = ctx.message.text.split(' ')[1];
  if (!id) return ctx.reply('Usage: /trace <id>');
  const trace = await getTrace(id);
  ctx.reply(formatTrace(trace));
});

bot.command('fallback_status', async ctx => {
  if (!isAdmin(ctx)) return;
  const status = await getFallbackStatus();
  ctx.reply(`Fallback Status: ${status}`);
});

bot.command('cache_status', async ctx => {
  if (!isAdmin(ctx)) return;
  const status = await getCacheStatus();
  ctx.reply(`Cache Status: ${status}`);
});

bot.command('cost_mode', async ctx => {
  if (!isAdmin(ctx)) return;
  const mode = await getCostMode();
  ctx.reply(`Cost Mode: ${mode}`);
});

bot.command('daily_report', async ctx => {
  if (!isAdmin(ctx)) return;
  const report = await getDailyReport();
  ctx.reply(report);
});

bot.command('set_cost_mode', async ctx => {
  if (!isAdmin(ctx)) return;
  const mode = ctx.message.text.split(' ')[1];
  if (!mode) return ctx.reply('Usage: /set_cost_mode <free_first|low_cost|premium>');
  await setCostMode(mode);
  ctx.reply(`Cost mode set to ${mode}`);
});

bot.command('disable_provider', async ctx => {
  if (!isAdmin(ctx)) return;
  const provider = ctx.message.text.split(' ')[1];
  if (!provider) return ctx.reply('Usage: /disable_provider <openai|anthropic|gemini>');
  await disableProvider(provider);
  ctx.reply(`Provider ${provider} disabled`);
});

bot.command('enable_provider', async ctx => {
  if (!isAdmin(ctx)) return;
  const provider = ctx.message.text.split(' ')[1];
  if (!provider) return ctx.reply('Usage: /enable_provider <openai|anthropic|gemini>');
  await enableProvider(provider);
  ctx.reply(`Provider ${provider} enabled`);
});

bot.command('clear_cache', async ctx => {
  if (!isAdmin(ctx)) return;
  await clearCache();
  ctx.reply('Cache cleared');
});

bot.command('reset_circuit', async ctx => {
  if (!isAdmin(ctx)) return;
  const provider = ctx.message.text.split(' ')[1];
  if (!provider) return ctx.reply('Usage: /reset_circuit <provider>');
  await resetCircuit(provider);
  ctx.reply(`Circuit for ${provider} reset`);
});

// Excel request mode (optional, for users)
bot.on('document', async ctx => {
  // Only allow Excel requests from admin or whitelisted users
  if (!isAdmin(ctx)) return;
  const fileId = ctx.message.document.file_id;
  // Download and process file, then reply with result
  const result = await handleExcelRequest(fileId, ctx.from.id);
  ctx.replyWithDocument({ source: result.fileBuffer, filename: result.filename });
});

// --- Scheduled Reports (to be called from cron or backend) ---
export async function sendHourlyReport() {
  const report = await getHourlyReport();
  for (const adminId of ADMIN_IDS) {
    await bot.telegram.sendMessage(adminId, `[Hourly Report]\n${report}`);
  }
}

export async function sendDailyReport() {
  const report = await getDailyReport();
  for (const adminId of ADMIN_IDS) {
    await bot.telegram.sendMessage(adminId, `[Daily Report]\n${report}`);
  }
}

export async function sendAlert(msg: string) {
  for (const adminId of ADMIN_IDS) {
    await bot.telegram.sendMessage(adminId, `[ALERT]\n${msg}`);
  }
}

// --- Trace Formatter ---
function formatTrace(trace: any) {
  return `Trace ID: ${trace.id}\nRoot Cause: ${trace.rootCause}\nProviders Tried: ${trace.providers.join(', ')}\nFailure Type: ${trace.failureType}\nRecommended Action: ${trace.recommendation}`;
}

// --- Security: Ignore unknown senders ---
bot.use((ctx, next) => {
  if (!ctx.from || !ADMIN_IDS.includes(ctx.from.id.toString())) return;
  return next();
});

// --- Start Bot ---
export function startTelegramBot() {
  bot.launch();
  console.log('Telegram bot started');
}
