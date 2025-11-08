# T-Care — Fully Automated Customer Support

> **Turn customer frustration into fixes—automatically.**

T-Care is a fully automated support agent that senses frustration, checks live network/service health, runs targeted fixes, and opens tickets—showing the exact data source for every step.

---

## 📋 Table of Contents

- [Problem & Solution](#problem--solution)
- [Key Features](#key-features)
- [Track Requirements](#track-requirements)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [User Flow](#user-flow)
- [Getting Started](#getting-started)
- [API Contracts](#api-contracts)
- [Demo Script](#demo-script)

---

## Problem & Solution

### Problem

Getting support takes too long because chatbots don't diagnose or act, and customers don't see real-time service issues.

### Solution

T-Care uses live sentiment signals (text tone, optional voice/camera consent) to gauge frustration and route the conversation through agentic checks that hit real system data—service status, tower/region health, incident feeds, and lightweight network tests. Our agents classify the intent, verify the issue against live backends, and either surface a known outage with ETA and a workaround or guide the user through three fast, personalized steps; if unresolved, we auto-create a complete ticket and notify via SMS/Slack. Every claim includes an evidence link ("View tower status," "See test log," "Open ticket") so users and ops can jump straight to the source. The whole flow is voice-first, privacy-safe (no face IDs, no raw audio stored), and focused on one outcome: turning customer frustration into a verified fix or a perfect escalation—automatically.

---

## Key Features

### Core Capabilities

✅ **Multi-Modal Input** — Text, voice, and optional camera-based sentiment analysis (privacy-first)  
✅ **Live System Checks** — Real-time tower/service health, incident feeds, network tests  
✅ **Intelligent Routing** — Detects outages vs. fixable issues and executes appropriate playbooks  
✅ **Evidence Transparency** — Every decision links to its data source (status, logs, tickets)  
✅ **Auto-Ticketing** — Creates complete Jira tickets with context and notifies via Slack  
✅ **Verification Loop** — Monitors recovery and updates customers automatically  
✅ **Full Support Portal** — Plans, coverage maps, device guides, network status, ticket tracking

### Agent Chain

```
START → INTENT_DETECTED → CHECK_STATUS → (OUTAGE | NO_OUTAGE) 
→ (WORKAROUND | PLAYBOOK_STEPS) → (RESOLVED | ESCALATE) → VERIFY → CLOSE
```

---

## Track Requirements

### NVIDIA (Nemotron/Agents) ✅

- **Beyond a chatbot** — (Agent chain: Classify → Check Status → Plan → Execute → Verify; calls status API, DNS probe, Jira, Slack, SMS)
- **Planning + execution** — (Planner selects outage vs. playbook; Executor runs steps, opens tickets, sends updates)
- **Model use** — (Nemotron handles intent/sentiment/root-cause draft; Triton-servable endpoint planned)
- **External integrations** — (Jira ticket creation, Slack war-room post, Twilio/SMS notify, service-health endpoint, test logs)
- **Evidence/traceability** — (Every claim has an evidence chip: "View tower status," "See test log," "Open ticket")
- **Real-world applicability** — (Hero flow: "data down" → check towers → workaround or guided fixes → auto-ticket → verify recovery)
- **GPU data ops** — (RAPIDS/cuDF available for anomaly/Happiness score computation)

### T-Mobile (Customer Happiness/Real-time Ops) ✅

- **Real-time, data-driven CX** — (Merge chat sentiment + ops health into regional "Happiness" with sparkline and drivers)
- **Detect issues before they spread** — (Status check + anomaly on complaints/KPIs; agent flags degradation with ETA)
- **Actionable insight** — (Workaround or 3-step playbook; if unresolved, auto-ticket + Slack post; user SMS updates)
- **Closes the loop** — (Verifier monitors recovery; marks resolved and messages user automatically)
- **Transparency** — (Evidence chips link to status snapshot, test logs, and ticket page)
- **Privacy-first** — (Voice/cam off by default; on-device posture/valence only; no face IDs or raw audio storage)
- **T-Mobile experience** — (Mock T-Mobile support UI with magenta theme, live status card, outage vs. steps flow)

---

## Architecture

### High-Level Overview

```
┌─────────────────┐
│  Frontend (UI)  │  Next.js/React + shadcn/ui + Tailwind
│  - Plans        │  
│  - Coverage     │  
│  - Assist       │  
│  - Tickets      │  
└────────┬────────┘
         │
┌────────▼────────┐
│  Agent Chain    │  
│  A1: Classifier │──► Nemotron (intent/sentiment)
│  A2: Checker    │──► Status API, KPIs, Incidents
│  A3: Planner    │──► Outage vs. Playbook selection
│  A4: Executor   │──► Run steps, call tools (Jira/Slack/Twilio)
│  A5: Verifier   │──► Monitor recovery, notify
└────────┬────────┘
         │
┌────────▼────────┐
│  Integrations   │  
│  - Jira/Slack   │  
│  - Twilio SMS   │  
│  - Status API   │  
│  - Test Logs    │  
└─────────────────┘
```

### Components

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, MapBox, Recharts
- **API Layer**: FastAPI microservices (planned) with mocked endpoints (current)
- **Agent Orchestration**: State machine or LangGraph for multi-step workflows
- **Data Store**: Postgres/Supabase for sessions, events, tickets, status snapshots
- **Privacy**: On-device feature extraction; no raw audio/video stored; aggregate scores only

---

## Tech Stack

### Core Technologies

- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router v6
- **Maps**: MapBox GL
- **Charts**: Recharts
- **State**: React Context + Hooks
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### Key Dependencies

```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.30.1",
  "mapbox-gl": "^3.16.0",
  "recharts": "^3.3.0",
  "@tanstack/react-query": "^5.83.0",
  "@radix-ui/*": "Latest",
  "lucide-react": "^0.462.0"
}
```

---

## User Flow

1. **Landing** → User selects "Get Help" or explores Plans/Coverage/Devices
2. **Auth** → Email OTP creates profile (role, ZIP, device type)
3. **Assist Screen** → Toggle voice/camera (consent), choose prompt or type/speak issue
4. **Classification** → Agent detects intent + sentiment/severity
5. **Status Check** → Query live region/tower/service health
   - **If Outage**: Show ETA + workaround → offer SMS updates
   - **If No Outage**: Run 3 fast steps (airplane toggle → APN → DNS)
6. **Resolution** → Fixed: show success; Not fixed: open ticket with Jira/Slack
7. **Verification** → Monitor recovery → notify user when resolved
8. **Tickets** → View history (customer) or queue (admin ops)

---

## Getting Started

### Prerequisites

- Node.js 18+ (recommend using [nvm](https://github.com/nvm-sh/nvm))
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/SupratikPanuganti/hackutd.git
cd hackutd

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## API Contracts

### POST `/api/classify`

**Request:**
```json
{
  "text": "wifi not working and i'm annoyed",
  "voice_enabled": false,
  "cam_enabled": false,
  "zip": "30332",
  "issue": "Cell Data"
}
```

**Response:**
```json
{
  "intent": "connectivity_down",
  "sentiment": -0.62,
  "severity": "high",
  "entities": { "zip": "30332", "issue": "Cell Data" }
}
```

### GET `/api/status?zip=30332&issue=Cell%20Data`

**Response (Outage):**
```json
{
  "region": "Midtown ATL",
  "tower_id": "eNB-123",
  "health": "degraded",
  "eta_minutes": 35,
  "happiness_score": 0.46,
  "sparkline": [0.71, 0.69, 0.65, 0.58, 0.52, 0.46],
  "source_url": "/status?zip=30332&tower=eNB-123"
}
```

**Response (OK):**
```json
{
  "region": "Midtown ATL",
  "tower_id": null,
  "health": "ok",
  "eta_minutes": null,
  "happiness_score": 0.72,
  "sparkline": [0.70, 0.71, 0.71, 0.72, 0.72, 0.72],
  "source_url": "/status?zip=30332"
}
```

### POST `/api/playbook/run`

**Request:**
```json
{
  "session_id": "sess_123",
  "step": "dns_probe",
  "params": { "host": "1.1.1.1" }
}
```

**Response:**
```json
{
  "step": "dns_probe",
  "result": "packet_loss_high",
  "metrics": { "latency_ms": 43, "loss_pct": 12 },
  "evidence_url": "/logs?session_id=sess_123&step=dns_probe"
}
```

### POST `/api/tickets`

**Request:**
```json
{
  "session_id": "sess_123",
  "summary": "Connectivity down after guided steps",
  "context": {
    "zip": "30332",
    "issue": "Cell Data",
    "steps_tried": ["toggle_airplane", "apn_check", "dns_probe"],
    "sentiment": -0.44
  }
}
```

**Response:**
```json
{
  "ticket_id": "INC-48291",
  "status": "open",
  "jira_url": "/ticket/INC-48291"
}
```

### POST `/api/notify`

**Request:**
```json
{
  "session_id": "sess_123",
  "channel": "sms",
  "event": "recovery"
}
```

**Response:**
```json
{ "ok": true }
```

### GET `/api/verify?session_id=sess_123`

**Response:**
```json
{
  "recovered": true,
  "observations": [
    { "t": "2025-11-08T20:04:00Z", "happiness_score": 0.61 },
    { "t": "2025-11-08T20:09:00Z", "happiness_score": 0.74 }
  ]
}
```

---

## Demo Script

### 90-Second Demo Flow

1. **User**: "my data is dead and it's annoying"
2. **Agent**: "I hear the frustration—checking towers near 30332…" *(spinner)*
3. **Outage Path**:
   - Agent: "Degradation at eNB-123; ETA 35 minutes"
   - Evidence: *View tower status* → opens source
   - Agent: "Want a workaround?" → Wi-Fi Calling setup
   - User: "Text me updates" → SMS scheduled
4. **No-Outage Path**:
   - Agent: "No known issues. Let's try 3 fast checks"
   - Steps: airplane toggle → APN check → DNS probe
   - Each shows: *See test log* evidence chip
   - If unresolved: *Open ticket* → Jira link + Slack post
5. **Verification**: Status card updates → "✅ Resolved" → SMS sent

---

## Data Model

### Database Schema (Minimal)

```sql
-- User profiles
profiles(id, role, zip, device_type)

-- Support sessions
sessions(id, user_id, issue, started_at, ended_at, outcome, voice_enabled, cam_enabled)

-- Event log with evidence trail
events(id, session_id, t, kind, payload_json, source_url)

-- Real-time status snapshots
status_snapshots(id, region, tower_id, t, health, eta_minutes, happiness_score)

-- Ticket tracking
tickets(id, session_id, external_ref, status, summary, created_at)

-- Playbook execution logs
playbook_runs(id, session_id, step, result, metrics_json, evidence_url, t)
```

---

## Privacy & Security

- 🔒 **Mic/Camera off by default** — Explicit consent required
- 🔒 **On-device processing** — Feature extraction only; frames/audio discarded
- 🔒 **No face IDs stored** — Posture/valence proxy only (aggregate scores)
- 🔒 **PII redaction** — Automatic scrubbing in event logs
- 🔒 **Rate limiting** — Input validation and abuse prevention

---

## Project Structure

```
hackutd/
├── src/
│   ├── components/
│   │   ├── assist/             # Support agent UI
│   │   │   ├── ConversationPanel.tsx
│   │   │   ├── EvidenceChips.tsx
│   │   │   ├── StatusCard.tsx
│   │   │   └── TicketDialog.tsx
│   │   ├── ui/                 # shadcn components
│   │   ├── FloatingAssistant.tsx
│   │   ├── MapboxMap.tsx
│   │   └── TopNav.tsx
│   ├── contexts/
│   │   └── AgenticContext.tsx  # Agent state management
│   ├── hooks/                  # Custom React hooks
│   ├── lib/
│   │   ├── mockApi.ts          # API mock implementations
│   │   ├── mockData.ts         # Seed data
│   │   └── utils.ts            # Utilities
│   ├── pages/
│   │   ├── Assist.tsx          # Agent page
│   │   ├── Coverage.tsx        # Coverage map
│   │   ├── Devices.tsx         # Device catalog
│   │   ├── Help.tsx            # Help landing
│   │   ├── Home.tsx            # Homepage
│   │   ├── NetworkStatus.tsx   # Tower status
│   │   └── Plans.tsx           # Plan comparison
│   └── main.tsx
├── public/
├── README.md
└── package.json
```

---

## Roadmap

### MVP (Current)
- ✅ Full T-Mobile-style site (Plans, Coverage, Devices, Status)
- ✅ Agentic assist with state machine
- ✅ Evidence chips & status card
- ✅ Mock API with realistic data

### Next Steps
- 🔲 Real Nemotron integration (Triton-served)
- 🔲 RAPIDS/cuDF anomaly detection
- 🔲 Live Jira/Slack/Twilio integrations
- 🔲 Voice AI (ASR/TTS)
- 🔲 OpenCV sentiment analysis
- 🔲 Admin dashboard for ops
- 🔲 Executive auto-brief reports

---

## Contributing

This project was built for HackUTD. Contributions, issues, and feature requests are welcome!

---

## License

MIT

---

## Acknowledgments

Built with ❤️ for HackUTD 2025 — NVIDIA & T-Mobile tracks

**Team**: [@SupratikPanuganti](https://github.com/SupratikPanuganti)
