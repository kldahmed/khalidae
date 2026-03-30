// Telegram API Client


const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = TELEGRAM_BOT_TOKEN ? `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}` : "";

async function callTelegram(method: string, body: any) {
  if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN not set");
  const res = await fetch(`${API_URL}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function sendMessage(chat_id: number, text: string, opts?: { parse_mode?: string }) {
  return callTelegram("sendMessage", { chat_id, text, ...opts });
}

export async function sendDocument(chat_id: number, file_url: string, opts?: { caption?: string }) {
  return callTelegram("sendDocument", { chat_id, document: file_url, ...opts });
}
