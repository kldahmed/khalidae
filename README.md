# Khalidae

Khalidae is a Next.js 16 platform for tools, projects, and site management workflows. The app includes a multi-agent management system that can delegate work across content, SEO, development, and monitoring agents using Anthropic, GitHub, and Vercel APIs.

## Development

Run the local development server:

```bash
npm run dev
```

Run linting:

```bash
npm run lint
```

## Required Environment Variables

Create `.env.local` with the following values:

```bash
ANTHROPIC_API_KEY=
GITHUB_TOKEN=
VERCEL_TOKEN=
MANAGER_SECRET=
KV_REST_API_URL=
KV_REST_API_TOKEN=
WHATSAPP_TOKEN=
WHATSAPP_PHONE_ID=
WHATSAPP_VERIFY_TOKEN=
OWNER_PHONE=
```

Notes:

- `ANTHROPIC_API_KEY`: required for the manager and all four specialized agents.
- `GITHUB_TOKEN`: required for repository read/write tools.
- `VERCEL_TOKEN`: required for deployments, build logs, and runtime log tools.
- `MANAGER_SECRET`: protects `/api/manager` and all agent APIs.
- `KV_REST_API_URL`: enables Vercel KV memory if configured.
- `KV_REST_API_TOKEN`: required together with `KV_REST_API_URL` for Vercel KV REST access.
- `WHATSAPP_TOKEN`: Meta Cloud API permanent token.
- `WHATSAPP_PHONE_ID`: WhatsApp Business phone number ID.
- `WHATSAPP_VERIFY_TOKEN`: webhook verification secret used by Meta.
- `OWNER_PHONE`: only this sender number is allowed to trigger the manager.

If KV is not configured, the system falls back to `data/agent-memory.json`.

## Multi-Agent Management System

The API layer lives in `src/app/api` and `src/lib/agents`.

### Manager API

Endpoint:

```http
POST /api/manager
```

Request body:

```json
{
	"instruction": "افحص الموقع وأصلح أي أخطاء",
	"secret": "your-manager-secret"
}
```

Response:

- `text/event-stream`
- Emits manager lifecycle events, agent delegation events, and the final result payload.

### WhatsApp Webhook

Endpoint:

```http
GET /api/whatsapp
POST /api/whatsapp
```

Behavior:

- `GET` verifies the webhook using `WHATSAPP_VERIFY_TOKEN`.
- `POST` accepts Meta Cloud API webhook payloads.
- Only messages from `OWNER_PHONE` are processed.
- Incoming owner messages are passed to the manager agent.
- Long manager responses are split into multiple WhatsApp replies.
- Status updates and read receipts are ignored safely.

### Specialized Agent APIs

Protected routes:

- `POST /api/agents/content`
- `POST /api/agents/seo`
- `POST /api/agents/dev`
- `POST /api/agents/monitor`

Request body:

```json
{
	"task": "Describe the task",
	"context": "Optional context",
	"secret": "your-manager-secret"
}
```

### Agent Status API

Endpoint:

```http
GET /api/agents/status?secret=your-manager-secret
```

Response includes:

- agent readiness
- available tools per agent
- memory backend in use
- recent task history
- site state snapshot

## Agent Responsibilities

### Manager

- understands Arabic and English instructions
- delegates work instead of acting directly
- reads and writes shared memory
- reports results in the same language as the owner

### Content Agent

- reads and updates site content via GitHub
- lists content directories
- writes commits through the GitHub Contents API

### SEO Agent

- audits metadata and descriptions
- reads and updates page files via GitHub
- fetches public page metadata from live URLs

### Dev Agent

- reads and updates code through GitHub
- lists repository files
- inspects Vercel build logs when debugging deployment failures

### Monitor Agent

- checks deployments and runtime logs from Vercel
- checks public page health
- reports findings with severity-oriented summaries

## Memory Backends

The manager stores:

- `last_tasks`: last 10 owner instructions
- `agent_logs`: recent execution history across all agents
- `site_state`: known issues and health summary

Backends:

- Vercel KV via REST when `KV_REST_API_URL` and `KV_REST_API_TOKEN` are available
- local JSON fallback at `data/agent-memory.json`

## External Integrations

### GitHub

Repository target:

- owner: `kldahmed`
- repo: `khalidae`
- branch: `main`

Implemented operations:

- read file
- write file
- list directory contents

### Vercel

Configured target:

- project: `prj_zwkDjk1BgKiM2TbrZm8pZjPaO8yT`
- team: `team_hqItF7AR7CcHVniixex6thuI`

Implemented operations:

- list deployments
- fetch build logs
- fetch runtime logs
- fetch public page health status

## Project Notes

- All agent routes run on the Node.js runtime.
- The Anthropic model used is `claude-sonnet-4-20250514`.
- All routes validate `MANAGER_SECRET` before executing agent work.
