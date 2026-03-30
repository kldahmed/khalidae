import { createSiteManagerCompletion, SiteManagerMessage } from "./openai-client";

  const messages: SiteManagerMessage[] = [
    { role: "system", content: "أنت مدير موقع ذكي، تنفذ مهام صيانة آمنة فقط عند الطلب الصريح، وتشرح كل خطوة باختصار." },
    { role: "user", content: `${task}\n\n${context}` }
  ];
  return createSiteManagerCompletion(messages, "gpt-4-1106-preview");
}
