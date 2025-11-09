# HackUTD — T-Mobile Admin Dashboard (hackutd)

This repository contains a Vite + React frontend and a small Express backend used for a HackUTD project: an admin dashboard that runs competitive intelligence analysis and provides notification services (email & Telegram).

The project includes:
- A React + TypeScript frontend (Vite) in the repository root `src/`.
- An Express backend in `server/` that exposes REST endpoints, WebSocket sentiment streaming, and notification services (email and Telegram).
- Admin pages and tooling for AI integrations (Parallel AI + Google Gemini) under `src/pages/Admin.tsx`.

This README gives a concise summary of how the pieces fit together, how to run the app locally, environment variables required, common endpoints, and troubleshooting tips.

## Repository layout

Top-level highlights:

- `src/` — Frontend application (React + TypeScript + Vite)
  - `src/pages` — App pages (Admin, Home, Assist, Devices, etc.)
  - `src/components` — UI components and shared UI
  - `src/lib` — client helpers (including `supportTicket.ts`)

- `server/` — Backend server (Express + TypeScript)
  - `server/src/index.ts` — server entrypoint and REST routes
  - `server/src/services/telegramService.ts` — Telegram helper
  - `server/src/services/emailService.ts` — Email helper (nodemailer)

- `.env` — Environment variables used by both frontend and backend (project root)

## Key features / endpoints

Backend important endpoints (see `server/src/index.ts`):

- Health: `GET  /health`
- Sentiment (websocket path `/sentiment`) and REST analytics:
  - `GET  /api/sentiment/current`
  - `GET  /api/sentiment/history`
  - `GET  /api/sentiment/analytics`
  - `POST /api/sentiment/start` and `POST /api/sentiment/stop`
- Decision engine:
  - `POST /api/decision/analyze`
- Notifications — Telegram:
  - `POST /api/notifications/telegram/tower-status` — send tower status alert
  - `GET  /api/notifications/telegram/status` — check configured + bot info
  - `POST /api/notifications/telegram/test` — send a test message
- Notifications — Email:
  - `POST /api/notifications/email/sos` — send SOS email
  - `GET  /api/notifications/email/status` — check email config
  - `POST /api/notifications/email/test` — send a test email
  - `POST /api/notifications/email/support-ticket` — submit support ticket
- Admin AI proxies (server-side proxies avoid CORS):
  - `POST /api/admin/parallel-extract`
  - `POST /api/admin/gemini-analyze`

Frontend noteworthy routes:

- `GET /admin` — Admin dashboard page (runs Parallel AI + Gemini via backend proxy)

## Environment variables

The server loads the root `.env` (the server code attempts to load `../../.env` relative to `server/src` so keep the `.env` in the repository root). Important variables used by the project include:

- `BACKEND_PORT` — port the backend listens on (default: `3001`)
- `VITE_BACKEND_URL` — base URL used by frontend to call the backend (e.g. `http://localhost:3001`)
- `TELEGRAM_BOT_TOKEN` — token for the Telegram bot (server `telegramService` uses this)
- `VITE_GEMINI_API_KEY` — Google Gemini API key used by the admin page
- Other VITE_* keys used by the frontend (mapbox, supabase, etc.)

Example `.env` snippet (do NOT commit secrets):

```powershell
VITE_BACKEND_URL=http://localhost:3001
BACKEND_PORT=3001
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
VITE_GEMINI_API_KEY=AIza...yourkey...
```

Notes:
- The server now explicitly initializes `telegramService` after `dotenv` loads so `TELEGRAM_BOT_TOKEN` must be present in the `.env` when you start the server.
- The client-side helper `src/lib/supportTicket.ts` trims a trailing slash from `VITE_BACKEND_URL` to avoid accidental double-slash (`//`) in constructed endpoints.

## Run locally (Windows / PowerShell)

1. Install dependencies for the frontend/root project (from repo root):

```powershell
# from repo root
npm install
```

2. Install and start backend server:

```powershell
cd server
npm install
npm run dev
```

You should see the server start on `http://localhost:3001` and a printed list of available endpoints.

3. Start the frontend (in repo root):

```powershell
# from repo root
npm run dev
```

Frontend will usually run on a Vite port such as `http://localhost:8084` (check the terminal).

## Quick testing & verification

- Check server health:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3001/health
```

- Check Telegram config & bot info:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3001/api/notifications/telegram/status
```

Look for `configured: true` and `botInfo` in the response. If `configured` is `false`, confirm `TELEGRAM_BOT_TOKEN` is present in `.env` and restart the backend.

- Send a Telegram test message (replace `<chatId>`):

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/notifications/telegram/test -ContentType 'application/json' -Body (ConvertTo-Json @{ chatId = '<chatId>' })
```

- Submit an email support ticket (example):

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/notifications/email/support-ticket -ContentType 'application/json' -Body (ConvertTo-Json @{ userEmail='you@example.com'; subject='Help wanted'; description='Details about issue' })
```

## Troubleshooting

- Telegram service still reports `not configured`:
  - Confirm `TELEGRAM_BOT_TOKEN` exists in the repo root `.env` and that you started the server from the repository root so dotenv resolves the same file.
  - Check server logs — you should see `[TelegramService] Telegram bot initialized` on startup if the token was picked up.

- 404 when calling an API endpoint from the frontend (double-slash in URL):
  - Ensure `VITE_BACKEND_URL` in `.env` does not cause double slashes. The client helper trims trailing slash but verify this value.

- Nodemailer / email failures:
  - Check `server/src/services/emailService.ts` configuration and make sure SMTP credentials are set in `.env` (if used). See server logs for the exact error returned by the mail provider.

- CORS errors calling external AI services from the browser:
  - The admin page uses backend proxy endpoints (`/api/admin/*`) to avoid CORS and to keep API keys secret. Make sure the backend is running and reachable from the frontend.

## Development notes / gotchas

- The backend attempts to load the `.env` file from the project root (by resolving `../../.env` relative to `server/src`). Keep the `.env` in the repository root.
- If you update `.env`, restart the backend to pick up changes.
- The project contains experimental admin integrations (Parallel AI, Google Gemini). The server exposes proxy endpoints so keys remain on the server.

## Contributing & branches

- The repository uses feature branches. Create a branch for changes, commit, and push. Example:

```powershell
git checkout -b feature/my-change
git add .
git commit -m "feat: describe change"
git push -u origin feature/my-change
```

## Where to look in the code

- Backend entrypoint and routes: `server/src/index.ts`
- Telegram helper: `server/src/services/telegramService.ts`
- Email helper: `server/src/services/emailService.ts`
- Admin frontend page: `src/pages/Admin.tsx`
- Support ticket client helper: `src/lib/supportTicket.ts` (normalizes backend base URL)

## License

This repository does not include a license file. Add one if you plan to publish or share.

---

If you'd like, I can:
- Start the backend and run a quick Telegram test message for you (if you provide the `chatId`),
- Create a shorter README tailored to a README badge / deploy instructions,
- Or open a PR with this README on a branch for review.

Happy hacking! 🚀
