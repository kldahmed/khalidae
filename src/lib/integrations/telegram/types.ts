// أنواع بيانات تكامل تيليغرام

export interface TelegramMessage {
  message_id: number;
  from: { id: number; username?: string; first_name?: string };
  chat: { id: number; type: string };
  date: number;
  text?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}
