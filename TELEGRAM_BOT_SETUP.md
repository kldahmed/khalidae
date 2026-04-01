# إعداد تكامل Telegram Bot على Vercel

## المتغيرات المطلوبة
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `SITE_MANAGER_SECRET`
- `OPENAI_API_KEY`

## رابط الويبهوك النهائي
```
https://khalidae.com/api/integrations/telegram?secret=TELEGRAM_WEBHOOK_SECRET
```

## طريقة تفعيل webhook

1. استبدل القيم في الرابط:
   - `TELEGRAM_BOT_TOKEN`: توكن البوت من BotFather
   - `TELEGRAM_WEBHOOK_SECRET`: نفس القيمة في متغير البيئة
   - `ENCODED_URL`: رابط الويبهوك النهائي بعد التشفير (url encode)

2. نفذ:
```
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=<ENCODED_URL>
```

مثال عملي:
```
https://api.telegram.org/bot123456:ABCDEF/setWebhook?url=https%3A%2F%2Fkhalidae.com%2Fapi%2Fintegrations%2Ftelegram%3Fsecret%3Dmysecret
```

## اختبار البوت
 أرسل /start أو /help للبوت
 
## الأوامر المدعومة
 
- /manager <تعليمات>
- /excel <وصف الجدول>
- /health

## القيود الحالية
- إرسال الملفات (XLSX) غير مفعل بعد (قريبًا)
- الردود نصية فقط حالياً

## خطوات دعم إرسال الملفات لاحقًا
- استخدم sendDocument في client.ts
- عدل handler لإرسال ملف XLSX عند توفره
