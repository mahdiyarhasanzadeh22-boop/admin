import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleRequest } from './src/requests.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3001);

try {
  const envText = await fs.readFile(path.join(root, '.env'), 'utf8');
  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
} catch {}

function send(res, result) {
  res.writeHead(result.status, { ...result.headers, 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(result.body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

async function serveStatic(req, res) {
  const requested = req.url === '/' ? '/admin.html' : req.url.split('?')[0];
  const file = path.resolve(root, `.${decodeURIComponent(requested)}`);
  if (!file.startsWith(root) || file === root) return res.writeHead(404).end('Not found');
  try {
    const data = await fs.readFile(file);
    const type = file.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' });
    res.end(data);
  } catch { res.writeHead(404).end('Not found'); }
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/health') return send(res, { status: 200, headers: { 'Content-Type': 'application/json' }, body: { ok: true, service: 'mahdiyarstudio-backend' } });
  if (url.pathname === '/api/requests') {
    if (req.method === 'OPTIONS') return res.writeHead(204).end();
    try {
      const result = await handleRequest({ method: req.method, query: Object.fromEntries(url.searchParams), body: req.method === 'POST' ? await readBody(req) : {} });
      return send(res, result);
    } catch (error) {
      console.error(error);
      return send(res, { status: 500, headers: { 'Content-Type': 'application/json' }, body: { ok: false, error: 'خطای داخلی سرور. تنظیمات اتصال را بررسی کنید.' } });
    }
  }
  return serveStatic(req, res);
}).listen(port, () => console.log(`Backend ready at http://localhost:${port}`));
