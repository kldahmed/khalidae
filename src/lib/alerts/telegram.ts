

export async function sendTelegramAlert({
  message,
  botToken = process.env.AI_TELEGRAM_BOT_TOKEN,
  chatId = process.env.AI_TELEGRAM_CHAT_ID,
}: {
  message: string;
  botToken?: string;
  chatId?: string;
}) {
  // Only run in server runtime
  if (typeof window !== 'undefined') return;
  if (process.env.AI_ALERTS_ENABLED !== 'true') return;
  if (!botToken || !chatId) return;
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    }),
  });
  if (!res.ok) {
    let errText = '';
    try { errText = await res.text(); } catch {}
    // eslint-disable-next-line no-console
    console.error(`[TelegramAlert] Failed: ${res.status} ${res.statusText} ${errText}`);
  }
}
