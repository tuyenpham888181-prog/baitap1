/* =====================================================================
   WEB SERVER TIỆM CHÈ NA (tiemchena.life) – chạy trên VPS
   - Chỉ phục vụ file web công khai (html/css/js/ảnh), CHẶN database và file nội bộ
   - Tiêu đề trang chủ lấy từ brain.db (bảng site_settings) → AI đổi được qua MCP
   - /admin (mật khẩu): xem tiêu đề hiện tại + bản nháp bài đăng do AI lưu
   Không cần cài thêm thư viện. brain.db dùng node:sqlite (Node ≥ 22.5);
   máy chạy Node cũ thì vẫn phục vụ web bình thường, chỉ tắt phần đọc brain.db.
   ===================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

loadEnv(path.join(__dirname, '.env'));

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = __dirname;
const DB_PATH = process.env.BRAIN_DB_PATH || path.join(__dirname, 'brain.db');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

// Không bao giờ phục vụ các file/thư mục này dù đuôi file hợp lệ
const BLOCKED = new Set(['server.js', 'node_modules', 'mcp', 'data', 'deploy']);

// ─── brain.db (dùng chung với MCP server) ───────────────────────────────────
let db = null;
try {
  const { DatabaseSync } = require('node:sqlite');
  if (fs.existsSync(DB_PATH)) {
    db = new DatabaseSync(DB_PATH);
    db.exec(`CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)`);
    db.exec(`CREATE TABLE IF NOT EXISTS drafts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT NOT NULL,
      channel TEXT, status TEXT NOT NULL DEFAULT 'draft', created_at TEXT NOT NULL)`);
  }
} catch (e) {
  console.warn('[brain.db] không dùng được (cần Node ≥ 22.5):', e.message);
}

function getSetting(key) {
  if (!db) return null;
  const row = db.prepare('SELECT value FROM site_settings WHERE key = ?').get(key);
  return row ? row.value : null;
}

const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Thay nội dung giữa <!--hero-title--> ... <!--/hero-title--> bằng tiêu đề trong brain.db
function applyHero(html) {
  for (const key of ['hero-title', 'hero-chip']) {
    const value = getSetting(key);
    if (value) {
      const re = new RegExp(`<!--${key}-->[\\s\\S]*?<!--/${key}-->`);
      html = html.replace(re, `<!--${key}-->${escapeHtml(value)}<!--/${key}-->`);
    }
  }
  return html;
}

// ─── /admin ─────────────────────────────────────────────────────────────────
function checkAdmin(req) {
  const user = process.env.ADMIN_USER || 'admin';
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return false;
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) return false;
  const given = Buffer.from(header.slice(6), 'base64').toString();
  const expected = `${user}:${pass}`;
  const a = Buffer.from(given), b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function renderAdmin() {
  const title = getSetting('hero-title');
  const chip = getSetting('hero-chip');
  const updated = db ? db.prepare("SELECT updated_at FROM site_settings WHERE key = 'hero-title'").get() : null;
  const drafts = db ? db.prepare('SELECT * FROM drafts ORDER BY id DESC LIMIT 30').all() : [];
  const rows = drafts.map(d => `
    <tr><td>#${d.id}</td><td><b>${escapeHtml(d.title)}</b><div class="c">${escapeHtml(d.content).replace(/\n/g, '<br>')}</div></td>
    <td>${escapeHtml(d.channel || '-')}</td><td>${escapeHtml(d.status)}</td><td>${escapeHtml(d.created_at)}</td></tr>`).join('');
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin – Tiệm Chè Na</title><style>
body{font-family:system-ui,Arial,sans-serif;background:#fff7ed;color:#1f2937;margin:0;padding:24px}
.box{background:#fff;border-radius:14px;padding:18px 20px;margin:0 auto 18px;max-width:960px;box-shadow:0 1px 3px #0001}
h1{color:#ea580c;max-width:960px;margin:0 auto 16px}h2{margin:0 0 10px;font-size:18px}
table{width:100%;border-collapse:collapse;font-size:14px}td,th{border-bottom:1px solid #f1f1f1;padding:8px;text-align:left;vertical-align:top}
.c{color:#4b5563;margin-top:4px;font-size:13px}.muted{color:#6b7280;font-size:13px}
</style></head><body>
<h1>🍧 Tiệm Chè Na – Admin website (VPS)</h1>
<div class="box"><h2>Tiêu đề trang chủ hiện tại</h2>
<p style="font-size:20px;font-weight:700">${title ? escapeHtml(title) : '<span class="muted">(mặc định trong index.html)</span>'}</p>
${chip ? `<p>Dòng nhỏ phía trên: <b>${escapeHtml(chip)}</b></p>` : ''}
<p class="muted">${updated ? 'Cập nhật lúc ' + escapeHtml(updated.updated_at) + ' (UTC) – qua AI agent Na / MCP' : ''}</p>
<p><a href="/" target="_blank">Mở trang chủ →</a></p></div>
<div class="box"><h2>Bản nháp bài đăng (${drafts.length})</h2>
${drafts.length ? `<table><tr><th>#</th><th>Nội dung</th><th>Kênh</th><th>Trạng thái</th><th>Tạo lúc (UTC)</th></tr>${rows}</table>` : '<p class="muted">Chưa có bản nháp nào.</p>'}
</div>
<p class="muted" style="text-align:center">brain.db: ${db ? 'đã kết nối' : 'CHƯA kết nối'}</p>
</body></html>`;
}

// ─── HTTP ───────────────────────────────────────────────────────────────────
function send(res, status, body, type = 'text/html; charset=utf-8', extra = {}) {
  res.writeHead(status, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(body);
}
const notFound = res => send(res, 404, `<!DOCTYPE html><html><head><meta charset="utf-8"><title>404 - Không tìm thấy</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;"><h1>404 - Không tìm thấy trang</h1><p><a href="/">Quay về trang chủ Tiệm Chè Na</a></p></body></html>`);

const server = http.createServer((req, res) => {
  let urlPath;
  try { urlPath = decodeURIComponent(req.url.split('?')[0]); } catch { urlPath = req.url.split('?')[0]; }

  if (urlPath === '/healthz') return send(res, 200, JSON.stringify({ ok: true, db: !!db }), 'application/json');

  if (urlPath === '/admin' || urlPath === '/admin/') {
    if (!process.env.ADMIN_PASSWORD) return send(res, 503, 'Admin chưa được cấu hình (thiếu ADMIN_PASSWORD).', 'text/plain; charset=utf-8');
    if (!checkAdmin(req)) return send(res, 401, 'Cần đăng nhập', 'text/plain; charset=utf-8', { 'WWW-Authenticate': 'Basic realm="Tiem Che Na Admin", charset="UTF-8"' });
    return send(res, 200, renderAdmin(), 'text/html; charset=utf-8', { 'Cache-Control': 'no-store' });
  }

  const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const segments = rel.split('/');
  // Chặn file ẩn (.env, .git…), thư mục nội bộ, đuôi không phải file web (.db, .md, .json…)
  if (segments.some(s => s.startsWith('.') || s === '..') || BLOCKED.has(segments[0])) return notFound(res);
  const ext = path.extname(rel).toLowerCase();
  const contentType = MIME_TYPES[ext];
  if (!contentType) return notFound(res);

  const filePath = path.join(PUBLIC_DIR, rel);
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) return notFound(res);

  fs.readFile(filePath, (err, content) => {
    if (err) return notFound(res);
    if (ext === '.html') content = applyHero(content.toString('utf8'));
    send(res, 200, content, contentType, { 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600' });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Tiệm Chè Na web đang chạy tại http://${HOST}:${PORT} · brain.db: ${db ? DB_PATH : 'không dùng'}`);
});

// Đọc file .env đơn giản (KEY=VALUE), không ghi đè biến đã có
function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
