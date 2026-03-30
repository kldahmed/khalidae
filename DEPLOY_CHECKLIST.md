# DEPLOY_CHECKLIST.md

## متغيرات البيئة المطلوبة للنشر على Vercel

- ANTHROPIC_API_KEY
- GITHUB_TOKEN
- VERCEL_TOKEN
- VERCEL_PROJECT_ID
- VERCEL_TEAM_ID (اختياري)
- MANAGER_SECRET
- CRON_SECRET (اختياري)
- KV_REST_API_URL (اختياري)
- KV_REST_API_TOKEN (اختياري)
- WHATSAPP_TOKEN (اختياري)
- WHATSAPP_PHONE_ID (اختياري)
- WHATSAPP_VERIFY_TOKEN (اختياري)
- OWNER_PHONE (اختياري)
- DAILY_REPORT_TEMPLATE_NAME (اختياري)
- DAILY_REPORT_TEMPLATE_LANG (اختياري)

## خطوات النشر

1. تأكد من وجود جميع متغيرات البيئة في إعدادات Vercel.
2. شغّل `npm install` ثم `npm run build` محليًا للتأكد من نجاح البناء.
3. ادفع التغييرات إلى GitHub (الفرع الرئيسي أو فرع النشر).
4. تحقق من أن Vercel يلتقط التغييرات ويبدأ عملية البناء تلقائيًا.
5. راقب سجل البناء في Vercel لأي أخطاء.
6. تحقق من عمل الموقع عبر الدومين root و www.

## خطوات rollback

- إذا فشل النشر، يمكنك إعادة نشر آخر نسخة ناجحة من لوحة تحكم Vercel.
- أو إعادة تعيين الفرع الرئيسي إلى commit مستقر.

## التحقق من الدومين وSSL

- تأكد من أن الدومين root و www مضافان في Vercel.
- تحقق من حالة SSL (يجب أن تظهر علامة ✅ بجانب كل دومين).
- إذا كان هناك مشكلة في SSL، تحقق من إعدادات DNS أو انتظر حتى يتم التفعيل تلقائيًا.

## ملاحظات
- لا توجد سكريبتات نشر قديمة أو إعدادات متضاربة.
- ملف vercel.json موجود ويحتوي فقط على إعدادات ضرورية (framework, buildCommand, outputDirectory, crons).
