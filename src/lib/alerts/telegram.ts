import fetch from 'node-fetch';

export async function sendTelegramAlert({
  message,
  botToken = process.env.AI_TELEGRAM_BOT_TOKEN,
  chatId = process.env.AI_TELEGRAM_CHAT_ID,
}: {
  message: string;
  botToken?: string;
  chatId?: string;
}) {
  if (!botToken || !chatId) return;
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    }),
  });
}
