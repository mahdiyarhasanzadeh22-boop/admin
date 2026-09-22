# Mahdiyar Studio Backend

Backend مستقل برای دریافت درخواست‌های همکاری و مدیریت آن‌ها.

## اجرا

1. Node.js 18 یا جدیدتر نصب کن.
2. `.env.example` را به `.env` تبدیل کن و مقدارها را وارد کن.
3. در Supabase فایل `schema.sql` را در SQL Editor اجرا کن.
4. اجرا:

```powershell
npm run dev
```

پنل: `http://localhost:3001/admin.html`
سلامت سرویس: `http://localhost:3001/health`
API ثبت درخواست: `POST http://localhost:3001/api/requests`

## اتصال سایت اصلی

در کد فرم سایت، endpoint را روی آدرس بک‌اند بگذار:

```js
const API_URL = 'https://YOUR-BACKEND-DOMAIN/api/requests';
fetch(API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName, phone, email, city, projectType,
    budgetRange, proposedPriceToman, preferredContact,
    description, pageUrl: location.href
  })
});
```

برای پنل، `GET /api/requests?token=ADMIN_TOKEN` و برای تغییر وضعیت، `POST` با `{ action: 'update', token, id, status, category }` استفاده می‌شود.

## امنیت

`SUPABASE_SERVICE_ROLE_KEY` فقط روی بک‌اند می‌ماند و نباید در HTML، GitHub عمومی یا مرورگر قرار بگیرد. `ADMIN_TOKEN` را طولانی و تصادفی انتخاب کن.
