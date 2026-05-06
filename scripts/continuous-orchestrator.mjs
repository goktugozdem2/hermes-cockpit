#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const statePath = path.join(root, "data", "autonomous-state.json");
const now = new Date().toISOString();

const projects = [
  { slug: "gorucu", name: "Görücü", url: "https://gorucu.co", owner: "Görücü Orchestrator" },
  { slug: "hermes-cockpit", name: "Hermes Cockpit", url: "https://hermes-cockpit.vercel.app", owner: "Bootstrap Orchestrator" },
  { slug: "sqlquest", name: "SQL Quest", url: "https://sqlquest.app", owner: "Growth Orchestrator" },
];

function makeId(prefix, value) {
  return `${prefix}-${value.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

async function probe(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { "user-agent": "Hermes-Cockpit-Orchestrator/0.1" },
    });
    const body = await response.text().catch(() => "");
    return { ok: response.ok, status: response.status, bodyLength: body.length };
  } catch (error) {
    return { ok: false, status: 0, error: error instanceof Error ? error.message : "unknown error" };
  } finally {
    clearTimeout(timeout);
  }
}

function upsertById(items, item) {
  const index = items.findIndex((existing) => existing.id === item.id);
  if (index === -1) return [...items, item];
  const existing = items[index];
  const next = [...items];
  next[index] = { ...existing, ...item, createdAt: existing.createdAt ?? item.createdAt };
  return next;
}

const state = JSON.parse(await readFile(statePath, "utf8"));
state.updatedAt = now;
state.mode = "continuous-orchestrator";
state.notificationPolicy = "telegram-only-for-urgent";
state.tickets ??= [];
state.workerRuns ??= [];
state.urgentAlerts ??= [];

const results = [];
for (const project of projects) {
  const result = await probe(project.url);
  results.push({ project, result });

  const ticketId = makeId("SMOKE", project.slug);
  const alertId = makeId("URGENT", `${project.slug}-production-smoke`);

  if (!result.ok) {
    state.tickets = upsertById(state.tickets, {
      id: ticketId,
      projectSlug: project.slug,
      title: `${project.name} production smoke is failing`,
      status: "blocked",
      priority: "P0",
      owner: project.owner,
      source: "smoke",
      createdAt: now,
      updatedAt: now,
      summary: `${project.url} returned ${result.status || "network error"}${result.error ? ` (${result.error})` : ""}.`,
      nextAction: "Interrupt Telegram, inspect production logs, and pause non-critical autonomous work for this project.",
    });
    const existingAlert = state.urgentAlerts.find((alert) => alert.id === alertId);
    state.urgentAlerts = upsertById(state.urgentAlerts, {
      id: alertId,
      projectSlug: project.slug,
      severity: "critical",
      title: `${project.name} production smoke failed`,
      body: `${project.url} returned ${result.status || "network error"}${result.error ? ` (${result.error})` : ""}.`,
      createdAt: now,
      notifiedTelegram: existingAlert?.notifiedTelegram ?? false,
    });
  } else {
    state.tickets = state.tickets.map((ticket) =>
      ticket.id === ticketId
        ? {
            ...ticket,
            status: "completed",
            priority: ticket.priority,
            updatedAt: now,
            summary: `${project.url} is reachable again with HTTP ${result.status}.`,
            nextAction: "No intervention needed; keep scheduled smoke running.",
          }
        : ticket,
    );
    state.urgentAlerts = state.urgentAlerts.filter((alert) => alert.id !== alertId);
  }
}

state.workerRuns = upsertById(state.workerRuns, {
  id: "RUN-CONTINUOUS-PORTFOLIO-ORCHESTRATOR",
  projectSlug: "hermes-cockpit",
  worker: "continuous-portfolio-orchestrator",
  status: "running",
  ticketId: "AUTO-1",
  lastHeartbeat: now,
  summary: `Audited ${projects.length} projects; ${results.filter(({ result }) => !result.ok).length} urgent failures.`,
});

await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
console.log(JSON.stringify({ updatedAt: now, failures: results.filter(({ result }) => !result.ok).length, results }, null, 2));
