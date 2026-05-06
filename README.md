# Hermes Cockpit

**Multi-project mission control for Hermes Agent users.**

Hermes Cockpit is an open-source dashboard for founders and developers running multiple AI-assisted projects with [Hermes Agent](https://github.com/NousResearch/hermes-agent) or similar autonomous coding workflows.

See what is running, blocked, broken, waiting, or ready to ship — across every project.

## Why

Hermes users can run autonomous workers, cron jobs, coding agents, smoke checks, deployment loops, and research agents across many products. But the status usually lives in scattered chats, local logs, GitHub commits, Vercel deploys, markdown reports, and TODO lists.

Hermes Cockpit turns that into one operator-facing dashboard:

- project health cards
- active agent/worker status
- pending and blocked tasks
- alerts and warnings
- deploy/check summaries
- project timelines
- links to reports, PRs, and production URLs

## MVP status

This repository currently contains the first UI/data-model MVP:

- multi-project home dashboard
- project detail pages
- seeded example projects: Görücü, SQL Quest, Hermes Cockpit
- cross-project alerts
- cross-project task queue
- agent/worker timeline model

Next milestones:

1. Supabase persistence
2. GitHub read-only connector
3. Vercel deployment connector
4. Hermes event ingestion API
5. Auth and private deployments
6. Plugin/docs for Hermes Agent cron workers to write status events

## Tech stack

- Next.js App Router
- TypeScript
- CSS modules/global CSS, no heavy UI dependency yet
- Designed for Supabase + Vercel later

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

```bash
npm run dev       # local development
npm run build     # production build
npm run start     # serve production build
npm run lint      # eslint
```

## Project philosophy

Hermes Cockpit is not trying to replace Linear, Plane, Sentry, Vercel, GitHub, or Hermes Agent.

It is the thin operator layer above them:

> one cockpit for all your Hermes-powered projects.

## License

MIT
