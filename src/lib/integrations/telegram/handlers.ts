// Telegram Update Handler
import { TelegramUpdate, TelegramCommand } from "./types";
import { sendMessage } from "./client";
import { planExcelWorkbook } from "@/lib/tools/excel-programmer/planner";
import { executeSiteTask } from "@/lib/site-manager/tasks";
import { getHealthReport } from "@/lib/site-manager/health";

function parseCommand(text: string): TelegramCommand | null {
  if (!text.startsWith("/")) return null;
  const [cmd, ...args] = text.trim().split(" ");
  return { command: cmd.slice(1).toLowerCase(), args: args.join(" ") };
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  const msg = update.message;
  if (!msg || !msg.text) return { ok: true };
  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const cmd = parseCommand(text);

  if (cmd) {
    switch (cmd.command) {
      case "start":
        await sendMessage(chatId, "👋 أهلاً بك في بوت خالداء!\n\nالأوامر المتاحة:\n/start — بدء\n/help — المساعدة\n/manager — أوامر الإدارة\n/excel — أداة الإكسل الذكي\n/health — فحص الصحة");
        break;
      case "help":
        await sendMessage(chatId, "الأوامر:\n/start\n/help\n/manager <تعليمات>\n/excel <وصف الجدول>\n/health");
        break;
      case "health":
        const health = getHealthReport();
        await sendMessage(chatId, `حالة الموقع: ${health.ok ? "✅" : "❌"}\n${health.message}`);
        break;
      case "manager":
        if (!cmd.args) {
          await sendMessage(chatId, "يرجى كتابة التعليمات بعد /manager");
        } else {
          const result = await executeSiteTask(cmd.args);
          await sendMessage(chatId, result);
        }
        break;
      case "excel":
        if (!cmd.args) {
          await sendMessage(chatId, "يرجى وصف الجدول المطلوب بعد /excel");
        } else {
          const plan = planExcelWorkbook(cmd.args);
          await sendMessage(chatId, `ملخص الخطة:\n${plan.summary || "تم إنشاء خطة إكسل."}`);
        }
        break;
      default:
        await sendMessage(chatId, "أمر غير معروف. أرسل /help للمساعدة.");
    }
    return { ok: true };
  }

  // تصنيف الرسائل العادية
  if (text.includes("إكسل") || text.toLowerCase().includes("excel")) {
    const plan = planExcelWorkbook(text);
    await sendMessage(chatId, `ملخص الخطة:\n${plan.summary || "تم إنشاء خطة إكسل."}`);
    return { ok: true };
  }
  if (text.includes("إدارة") || text.toLowerCase().includes("manager")) {
    const result = await executeSiteTask(text);
    await sendMessage(chatId, result);
    return { ok: true };
  }
  // أي رسالة أخرى
  await sendMessage(chatId, "مرحباً! أرسل /help لرؤية الأوامر المتاحة.");
  return { ok: true };
}
