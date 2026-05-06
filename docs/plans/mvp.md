# Hermes Cockpit MVP Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build an open-source multi-project mission control dashboard for Hermes Agent users.

**Architecture:** Start with a static typed data model and Next.js UI. Then add Supabase persistence, event ingestion, and connectors. Keep Hermes worker/event concepts first-class.

**Tech Stack:** Next.js App Router, TypeScript, Supabase later, Vercel later, GitHub API later.

---

## Task 1: Static MVP foundation

**Objective:** Provide a working dashboard with project cards, alerts, tasks, agent runs, and project detail pages.

**Files:**
- `src/lib/cockpit-data.ts`
- `src/app/page.tsx`
- `src/app/projects/[slug]/page.tsx`
- `src/app/globals.css`

**Verification:**

```bash
npm run lint
npm run build
```

Expected: both pass.

## Task 2: Open-source packaging

**Objective:** Make the repo credible for Hermes community contributors.

**Files:**
- `README.md`
- `LICENSE`
- `ROADMAP.md`
- `CONTRIBUTING.md`

**Verification:**

```bash
git status --short
```

Expected: docs are tracked and no secrets are present.

## Task 3: Durable database design

**Objective:** Add Supabase schema and seed data.

**Files:**
- `supabase/migrations/0001_initial_schema.sql`
- `supabase/seed.sql`
- `docs/event-schema.md`

**Tables:**
- projects
- tasks
- alerts
- agent_runs
- events
- checks
- integrations

## Task 4: Hermes event ingestion

**Objective:** Let Hermes cron/background workers report state into Cockpit.

**Files:**
- `src/app/api/events/route.ts`
- `docs/hermes-worker-integration.md`
- `scripts/send-event.mjs`

**Security:** signed token only; never accept or display secrets.

## Task 5: Connectors

**Objective:** Add read-only external project health integrations.

**Connectors:**
- GitHub repo status and actions
- Vercel deployments
- Supabase project/table health
- GSC/manual checklist
