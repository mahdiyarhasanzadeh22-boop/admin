import { handleRequest } from '../src/requests.js';

function corsOrigin(requestOrigin) {
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map((item) => item.trim()).filter(Boolean);
  return allowed.includes(requestOrigin) ? requestOrigin : allowed[0] || '*';
}

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return {};
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  res.setHeader('Access-Control-Allow-Origin', corsOrigin(origin));
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const result = await handleRequest({ method: req.method, query: req.query || {}, body: parseBody(req) });
    return res.status(result.status).set(result.headers).json(result.body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: 'خطای داخلی سرور. تنظیمات اتصال را بررسی کنید.' });
  }
}
