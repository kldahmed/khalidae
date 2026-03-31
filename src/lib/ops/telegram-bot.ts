// Telegram Bot Operations Layer
// Telegraf removed: using plain Telegram Bot API via fetch
import { getHealth, getProviders, getErrors, getTrace, getFallbackStatus, getCacheStatus, getCostMode, setCostMode, disableProvider, enableProvider, clearCache, resetCircuit, getDailyReport, getHourlyReport, handleExcelRequest } from './ops-backend';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_IDS = (process.env.TELEGRAM_ADMIN_IDS || '').split(',').map(id => id.trim());
if (!BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN missing');

function isAdmin(userId: string) {
  return ADMIN_IDS.includes(userId);
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMessage(chatId: string, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}

async function sendDocument(chatId: string, fileBuffer: ArrayBuffer | Uint8Array, filename: string) {
  const bytes = fileBuffer instanceof Uint8Array ? fileBuffer : new Uint8Array(fileBuffer);
  const form = new FormData();
  const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  form.append('chat_id', chatId);
  form.append('document', blob, filename);
  await fetch(`${TELEGRAM_API}/sendDocument`, {
    method: 'POST',
    body: form
  });
}

// --- Command Parser ---
export async function handleTelegramCommand({ message, from }: { message: string, from: { id: string } }) {
  const userId = from.id.toString();
  const [cmd, ...args] = message.trim().split(/\s+/);
  if (!isAdmin(userId)) return;
  switch (cmd) {
    case '/health': {
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
export async function handleTelegramDocument({ document, from }: { document: { file_id: string }, from: { id: string } }) {
  const userId = from.id.toString();
  if (!isAdmin(userId)) return;
  const fileId = document.file_id;
  const result = await handleExcelRequest(fileId, userId);
  // Ensure fileBuffer is Uint8Array before passing
  const bytes = result.fileBuffer instanceof Uint8Array ? result.fileBuffer : new Uint8Array(result.fileBuffer);
  await sendDocument(userId, bytes, result.filename);
}

// --- Scheduled Reports (to be called from cron or backend) ---
export async function sendHourlyReport() {
  const report = await getHourlyReport();
  for (const adminId of ADMIN_IDS) {
    await sendMessage(adminId, `[Hourly Report]\n${report}`);
  }
}

export async function sendDailyReport() {
  const report = await getDailyReport();
  for (const adminId of ADMIN_IDS) {
    await sendMessage(adminId, `[Daily Report]\n${report}`);
  }
}

export async function sendAlert(msg: string) {
  for (const adminId of ADMIN_IDS) {
    await sendMessage(adminId, `[ALERT]\n${msg}`);
  }
}

// --- Trace Formatter ---
function formatTrace(trace: any) {
  return `Trace ID: ${trace.id}\nRoot Cause: ${trace.rootCause}\nProviders Tried: ${trace.providers?.join(', ')}\nFailure Type: ${trace.failureType}\nRecommended Action: ${trace.recommendation}`;
}

// No bot.use or start: handled via webhook route
