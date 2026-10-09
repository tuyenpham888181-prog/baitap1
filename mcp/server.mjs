/* =====================================================================
   MCP SERVER "my-business" – cánh tay của agent Na (goClaw) trên VPS
   Transport: streamable-http, endpoint POST /mcp (stateless)
   Dùng CHUNG brain.db với website (../brain.db)

   Tools (goClaw thêm tiền tố biz__):
     update_hero    – đổi tiêu đề trang chủ tiemchena.life (thấy ngay khi refresh)
     reset_hero     – trả tiêu đề về mặc định
     save_draft     – lưu nháp bài đăng (xem ở tiemchena.life/admin)
     list_drafts    – xem các bản nháp gần nhất
     get_shop_info  – đọc thông tin tiệm, menu, giá, giọng văn từ brain.db

   Bảo mật: chỉ nghe trong VPS; tường lửa chặn cổng 3001 từ Internet,
   chỉ cho mạng Docker (goClaw) gọi vào. Có thể bật thêm MCP_TOKEN (Bearer).
   ===================================================================== */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv(path.join(__dirname, '..', '.env'));

const PORT = Number(process.env.MCP_PORT) || 3001;
const HOST = process.env.MCP_HOST || '127.0.0.1';
const DB_PATH = process.env.BRAIN_DB_PATH || path.join(__dirname, '..', 'brain.db');
const SITE_URL = process.env.SITE_URL || 'https://tiemchena.life';
const MCP_TOKEN = process.env.MCP_TOKEN || '';

const db = new DatabaseSync(DB_PATH);
db.exec(`CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)`);
db.exec(`CREATE TABLE IF NOT EXISTS drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT NOT NULL,
  channel TEXT, status TEXT NOT NULL DEFAULT 'draft', created_at TEXT NOT NULL)`);

const now = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
const log = (tool, msg) => console.log(`[${new Date().toISOString()}] ${tool}: ${msg}`);
const ok = text => ({ content: [{ type: 'text', text }] });
const fail = text => ({ content: [{ type: 'text', text: 'LỖI: ' + text }], isError: true });
const clean = s => String(s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

function buildServer() {
  const server = new McpServer({ name: 'my-business', version: '1.0.0' });

  server.registerTool('update_hero', {
    title: 'Đổi tiêu đề trang chủ',
    description: 'Đổi tiêu đề lớn (hero) trên trang chủ tiemchena.life. Dùng khi chủ tiệm muốn đổi tiêu đề landing, chạy khuyến mãi, flash sale. Khách refresh trang là thấy ngay.',
    inputSchema: {
      title: z.string().describe('Tiêu đề mới, 5–120 ký tự, ví dụ "Flash sale cuối tuần giảm 30%"'),
      chip: z.string().optional().describe('(Tùy chọn) dòng chữ nhỏ phía trên tiêu đề, tối đa 60 ký tự')
    }
  }, async ({ title, chip }) => {
    const t = clean(title);
    if (t.length < 5 || t.length > 120) return fail('Tiêu đề phải dài 5–120 ký tự.');
    const c = chip !== undefined ? clean(chip) : null;
    if (c !== null && c.length > 60) return fail('Dòng chữ nhỏ tối đa 60 ký tự.');
    const upsert = db.prepare(`INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`);
    upsert.run('hero-title', t, now());
    if (c) upsert.run('hero-chip', c, now());
    log('update_hero', JSON.stringify({ title: t, chip: c }));
    return ok(`Đã đổi tiêu đề trang chủ thành: "${t}"${c ? ` (dòng nhỏ: "${c}")` : ''}. Khách mở ${SITE_URL} và refresh là thấy ngay.`);
  });

  server.registerTool('reset_hero', {
    title: 'Trả tiêu đề trang chủ về mặc định',
    description: 'Xóa tiêu đề tùy chỉnh, trang chủ quay về tiêu đề gốc "Một đơn, đủ nóng đủ lạnh…". Dùng khi hết khuyến mãi.',
    inputSchema: {}
  }, async () => {
    db.prepare("DELETE FROM site_settings WHERE key IN ('hero-title', 'hero-chip')").run();
    log('reset_hero', 'về mặc định');
    return ok('Đã trả tiêu đề trang chủ về mặc định.');
  });

  server.registerTool('save_draft', {
    title: 'Lưu nháp bài đăng',
    description: 'Lưu một bản nháp bài đăng (Facebook, group, Zalo, TikTok…) hoặc ý tưởng nội dung vào brain.db để chủ tiệm duyệt sau tại tiemchena.life/admin. Dùng khi chủ tiệm nói "ghi lại idea", "lưu nháp", "viết giúp bài… rồi lưu lại".',
    inputSchema: {
      title: z.string().describe('Tiêu đề ngắn của bản nháp, 3–120 ký tự'),
      content: z.string().describe('Nội dung bản nháp, 5–5000 ký tự'),
      channel: z.enum(['facebook', 'group', 'zalo', 'tiktok', 'email', 'khac']).optional().describe('Kênh định đăng')
    }
  }, async ({ title, content, channel }) => {
    const t = clean(title);
    const body = String(content).trim();
    if (t.length < 3 || t.length > 120) return fail('Tiêu đề bản nháp phải dài 3–120 ký tự.');
    if (body.length < 5 || body.length > 5000) return fail('Nội dung bản nháp phải dài 5–5000 ký tự.');
    const r = db.prepare('INSERT INTO drafts (title, content, channel, created_at) VALUES (?, ?, ?, ?)')
      .run(t, body, channel || null, now());
    log('save_draft', `#${r.lastInsertRowid} "${t}" (${channel || '-'})`);
    return ok(`Đã lưu bản nháp #${r.lastInsertRowid}: "${t}". Xem tại ${SITE_URL}/admin.`);
  });

  server.registerTool('list_drafts', {
    title: 'Xem các bản nháp',
    description: 'Liệt kê các bản nháp bài đăng gần nhất trong brain.db.',
    inputSchema: { limit: z.number().int().min(1).max(20).optional().describe('Số bản nháp, mặc định 5') }
  }, async ({ limit }) => {
    const rows = db.prepare('SELECT id, title, channel, status, created_at, content FROM drafts ORDER BY id DESC LIMIT ?').all(limit || 5);
    log('list_drafts', `${rows.length} bản`);
    if (!rows.length) return ok('Chưa có bản nháp nào.');
    return ok(rows.map(d => `#${d.id} [${d.status}] ${d.title} (${d.channel || '-'}, ${d.created_at} UTC)\n${d.content.slice(0, 300)}${d.content.length > 300 ? '…' : ''}`).join('\n\n'));
  });

  server.registerTool('get_shop_info', {
    title: 'Thông tin tiệm từ brain.db',
    description: 'Đọc thông tin thật của Tiệm Chè Na trong brain.db: menu, giá, định vị, khung giá, cách trả lời khi khách so sánh đối thủ, giọng văn. Dùng trước khi viết bài hoặc trả lời câu hỏi về giá.',
    inputSchema: {}
  }, async () => {
    const pick = table => { try { return db.prepare(`SELECT title, content FROM ${table}`).all(); } catch { return []; } };
    const sections = [['THÔNG TIN KINH DOANH', pick('business')], ['GIỌNG VĂN', pick('brand_voice')], ['GHI CHÚ HIỆN TẠI', [
      ...db.prepare("SELECT key AS title, value AS content FROM site_settings").all()
    ]]];
    log('get_shop_info', 'đọc brain.db');
    return ok(sections.map(([h, rows]) => `== ${h} ==\n` + (rows.length ? rows.map(r => `- ${r.title}: ${r.content}`).join('\n') : '(trống)')).join('\n\n'));
  });

  return server;
}

// ─── HTTP (stateless streamable-http) ───────────────────────────────────────
const httpServer = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, name: 'my-business' }));
  }
  if (url !== '/mcp') { res.writeHead(404); return res.end(); }
  if (MCP_TOKEN && req.headers.authorization !== `Bearer ${MCP_TOKEN}`) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32001, message: 'Unauthorized' }, id: null }));
  }
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json', Allow: 'POST' });
    return res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed' }, id: null }));
  }
  let body;
  try {
    const chunks = [];
    for await (const c of req) { chunks.push(c); if (chunks.reduce((n, x) => n + x.length, 0) > 1_000_000) throw new Error('too large'); }
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null }));
  }
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on('close', () => { transport.close(); server.close(); });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch (e) {
    console.error(`[${new Date().toISOString()}] mcp error:`, e);
    if (!res.headersSent) { res.writeHead(500); res.end(); }
  }
});

httpServer.listen(PORT, HOST, () => {
  console.log(`[${new Date().toISOString()}] MCP my-business nghe tại http://${HOST}:${PORT}/mcp · brain.db: ${DB_PATH}`);
});

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
