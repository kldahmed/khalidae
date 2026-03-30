# SITE_MANAGER_SETUP.md

## المتغيرات المطلوبة

- `OPENAI_API_KEY`: مفتاح OpenAI (ضعه في إعدادات Vercel أو .env.local)
- `SITE_MANAGER_SECRET`: سر الإدارة (ضعه في إعدادات Vercel أو .env.local)

## نقاط النهاية (Endpoints)

### فحص الصحة
- `GET /api/site-manager/health?secret=YOUR_SECRET`
- الهيدر البديل: `x-site-manager-secret: YOUR_SECRET`

### تحليل الموقع
- `POST /api/site-manager/analyze`
- البودي: `{ "prompt": "...", "context": "..." }`
- الهيدر: `x-site-manager-secret: YOUR_SECRET`

### تنفيذ مهمة صيانة
- `POST /api/site-manager/tasks`
- البودي: `{ "task": "...", "context": "..." }`
- الهيدر: `x-site-manager-secret: YOUR_SECRET`

## أمثلة curl

```bash
curl -X GET "https://YOUR_DOMAIN/api/site-manager/health?secret=YOUR_SECRET"

curl -X POST "https://YOUR_DOMAIN/api/site-manager/analyze" \
  -H "x-site-manager-secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "حلل حالة الموقع"}'

curl -X POST "https://YOUR_DOMAIN/api/site-manager/tasks" \
  -H "x-site-manager-secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"task": "اقترح إصلاحات للمشاكل الحالية"}'
```

## حدود الأمان
- جميع المسارات تتطلب سر الإدارة (`SITE_MANAGER_SECRET`).
- لا يتم تنفيذ أي مهمة صيانة إلا عند الطلب الصريح.
- لا تحفظ المفاتيح داخل الكود، استخدم env فقط.
- لا تعرض أي مخرجات حساسة في الردود.

## ملاحظات
- يمكن توسيع الخدمات لاحقًا لتشمل مهام أعمق أو تكاملات إضافية.
