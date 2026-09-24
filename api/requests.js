import { handleRequest } from '../src/requests.js';

function corsOrigin(requestOrigin) {
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map((item) => item.trim()).filter(Boolean);
  if (!requestOrigin) return allowed[0] || '*';
  return allowed.length === 0 || allowed.includes(requestOrigin) ? requestOrigin : '';
}

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body || '{}'); } catch { return null; }
  }
  return {};
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowedOrigin = corsOrigin(origin);
  if (allowedOrigin) res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const body = parseBody(req);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).setHeader('Cache-Control', 'no-store').json({ ok: false, error: 'درخواست معتبر نیست.' });
  }

  try {
    const result = await handleRequest({ method: req.method, headers: req.headers || {}, body });
    return res.status(result.status).set(result.headers).json(result.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: 'خطای داخلی سرور. تنظیمات اتصال را بررسی کنید.' });
  }
}

