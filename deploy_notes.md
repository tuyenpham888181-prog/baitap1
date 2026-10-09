# Deploy tiemchena.life lên VPS (Ngày 14)

## Kiến trúc trên VPS 103.97.124.20 (SSH cổng 2018)

| Thành phần | Chạy ở | Ai truy cập |
|---|---|---|
| Website (`server.js`, Node 24, không cần npm install) | `127.0.0.1:3000` – systemd `mywebsite` | Caddy → https://tiemchena.life, https://www.tiemchena.life |
| MCP `my-business` (`mcp/server.mjs`) | `172.17.0.1:3001/mcp` – systemd `mcp-server` | Chỉ goClaw (Docker). Tường lửa ufw chỉ mở 3001 cho mạng Docker 172.16.0.0/12 |
| goClaw | `127.0.0.1:18790` (Docker) | Caddy → https://agent.tiemchena.life |
| brain.db | `/opt/my-website/data/brain.db` | Website + MCP dùng chung (KHÔNG có trong GitHub, upload bằng scp) |

## Biến .env cần có trên VPS
Xem `.env.example`: `PORT, HOST, BRAIN_DB_PATH, ADMIN_USER, ADMIN_PASSWORD, MCP_PORT, MCP_HOST, SITE_URL, MCP_TOKEN(tùy chọn)`.

## Lệnh
```bash
cd /opt/my-website && git pull
cd mcp && npm ci --omit=dev   # chỉ khi package.json của MCP thay đổi
systemctl restart mywebsite mcp-server
systemctl status mywebsite mcp-server
journalctl -u mcp-server -f     # xem log từng lần AI gọi tool
```

## goClaw Dashboard → MCP Servers
goClaw chặn mọi URL MCP trỏ vào IP nội bộ (chống SSRF, không tắt được) → dùng "Kịch bản B":
Caddy mở `https://tiemchena.life/_mcp/*` → `172.17.0.1:3001` và MCP **bắt buộc Bearer token** (`MCP_TOKEN` trong `.env`).
- Name: `my-business` · Giao thức: `Streamable HTTP`
- URL: `https://tiemchena.life/_mcp/mcp`
- Header: `Authorization` = `Bearer <MCP_TOKEN>` (lấy: `grep MCP_TOKEN /opt/my-website/.env`)
- Tiền tố công cụ: `biz` → tool: `mcp_biz__update_hero`, `mcp_biz__reset_hero`, `mcp_biz__save_draft`, `mcp_biz__list_drafts`, `mcp_biz__get_shop_info`
- Gán MCP cho agent Na (cột Agents) + dặn trong AGENTS.md luôn gọi tool

## Trang quản trị
https://tiemchena.life/admin – xem tiêu đề hiện tại + bản nháp bài do AI lưu (mật khẩu trong `.env` trên VPS).
