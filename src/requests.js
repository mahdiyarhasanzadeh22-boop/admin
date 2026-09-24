import { randomUUID } from 'node:crypto';

const TABLE = 'requests';
const ALLOWED_STATUS = new Set(['جدید', 'در حال بررسی', 'تکمیل‌شده']);
const ALLOWED_CATEGORIES = new Set(['عمومی', 'پوستر', 'هویت بصری', 'شبکه‌های اجتماعی']);

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function adminAuthorized(token) {
  const adminToken = process.env.ADMIN_TOKEN?.trim();
  return Boolean(adminToken && token && token === adminToken);
}

function normalize(value, max = 4000) {
  return String(value ?? '').trim().slice(0, max);
}

function publicRow(data) {
  return {
    id: randomUUID(),
    full_name: normalize(data.fullName, 120),
    phone: normalize(data.phone, 40),
    email: normalize(data.email, 160).toLowerCase(),
    city: normalize(data.city, 80),
    project_type: normalize(data.projectType, 100),
    budget_range: normalize(data.budgetRange, 100),
    proposed_price_toman: normalize(data.proposedPriceToman, 40),
    preferred_contact: normalize(data.preferredContact, 80),
    description: normalize(data.description, 4000),
    page_url: normalize(data.pageUrl, 500)
  };
}

async function supabase(path, options = {}) {
  const base = requiredEnv('SUPABASE_URL').replace(/\/$/, '');
  const key = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  const result = await fetch(`${base}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await result.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch {}
  if (!result.ok) throw new Error(body?.message || body?.hint || `Supabase HTTP ${result.status}`);
  return body;
}

function json(status, body, headers = {}) {
  return { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers }, body };
}

function bearerToken(headers = {}) {
  const value = headers.authorization || headers.Authorization || '';
  const match = String(value).match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

export async function handleRequest({ method, headers = {}, body = {} }) {
  if (method === 'GET') {
    if (!adminAuthorized(bearerToken(headers))) return json(401, { ok: false, error: 'Unauthorized' });
    const rows = await supabase(`${TABLE}?select=*&order=created_at.desc`);
    return json(200, { ok: true, rows });
  }

  if (method !== 'POST') return json(405, { ok: false, error: 'Method not allowed' }, { Allow: 'GET, POST, PATCH' });
  if (body.website) return json(202, { ok: true });

  if (body.action === 'update') {
    if (!adminAuthorized(bearerToken(headers))) return json(401, { ok: false, error: 'Unauthorized' });
    const id = normalize(body.id, 80);
    if (!id || !ALLOWED_STATUS.has(body.status) || !ALLOWED_CATEGORIES.has(body.category)) {
      return json(422, { ok: false, error: 'وضعیت یا دسته‌بندی معتبر نیست.' });
    }
    const updated = await supabase(`${TABLE}?id=eq.${encodeURIComponent(id)}&select=id`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ status: body.status, category: body.category })
    });
    if (!Array.isArray(updated) || updated.length === 0) return json(404, { ok: false, error: 'درخواست پیدا نشد.' });
    return json(200, { ok: true });
  }

  const row = publicRow(body);
  if (row.full_name.length < 3 || row.phone.length < 8 || !row.email.includes('@') || row.description.length < 15) {
    return json(422, { ok: false, error: 'اطلاعات فرم کامل یا معتبر نیست.' });
  }
  const result = await supabase(TABLE, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row)
  });
  return json(201, { ok: true, request: Array.isArray(result) ? result[0] : result });
}

export { adminAuthorized };

