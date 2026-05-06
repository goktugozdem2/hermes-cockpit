# Contributing to Hermes Cockpit

Thanks for helping build Hermes Cockpit.

This project is for Hermes Agent users and developers who want a simple open-source cockpit for many AI-assisted projects.

## Good first contributions

- Add new dashboard widgets
- Improve project cards
- Add event schema examples
- Add connector docs for GitHub, Vercel, Supabase, or Hermes cron jobs
- Improve accessibility and responsive design
- Add tests around data transforms

## Local setup

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Pull request expectations

- Keep the dashboard privacy-safe. Never display raw tokens, secrets, env files, or credentials.
- Prefer small PRs.
- Add or update docs when introducing a new concept.
- Keep the MVP connector-first and avoid heavy dependencies unless there is a clear reason.

## Design principles

- Operator-first: show the most urgent project state immediately.
- Multi-project by default.
- Hermes-friendly: autonomous workers, cron jobs, reports, and agent heartbeats are first-class concepts.
- Bring your own stack: GitHub, Vercel, Supabase, local files, or any future connector.
