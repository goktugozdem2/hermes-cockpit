# Hermes Cockpit Roadmap

Hermes Cockpit is starting as a focused multi-project dashboard for Hermes Agent users.

## v0.1 — Static cockpit MVP

- [x] Project cards
- [x] Status badges
- [x] Cross-project alert strip
- [x] Cross-project task queue
- [x] Project detail pages
- [x] Agent/worker state model
- [x] Timeline model
- [x] MIT license and open-source positioning

## v0.2 — Durable data

- [ ] Supabase schema
- [ ] `projects`, `tasks`, `alerts`, `agent_runs`, `events`, `checks`
- [ ] Seed script
- [ ] Read-only dashboard backed by database
- [ ] Local development Docker/Supabase instructions

## v0.3 — Hermes event ingestion

- [ ] `/api/events` endpoint
- [ ] Signed write token support
- [ ] JSON event schema
- [ ] Hermes cron-worker prompt template
- [ ] CLI/script helper to send heartbeats and final reports

## v0.4 — Integrations

- [ ] GitHub repo connector
- [ ] GitHub Actions check summary
- [ ] Vercel deployments connector
- [ ] Supabase project health connector
- [ ] Manual GSC checklist/status connector

## v0.5 — Collaboration

- [ ] Auth
- [ ] Private project spaces
- [ ] GitHub issue templates
- [ ] Contributor docs
- [ ] Plugin docs for Hermes Agent users
