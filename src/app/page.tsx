import Link from "next/link";
import { CeoUsageDashboard } from "@/components/ceo-usage-dashboard";
import { alerts, getProjectStats, projects, tasks } from "@/lib/cockpit-data";
import {
  autonomousState,
  getAutonomousStats,
  getAutonomousTickets,
  getAutonomousWorkerRuns,
  getHourlyActivity,
  getUrgentAlerts,
} from "@/lib/autonomous-state";
import { getBudgetSnapshot, getPrioritizedTicketPlan } from "@/lib/budget-agent";

const statusLabels = {
  healthy: "Healthy",
  warning: "Warning",
  blocked: "Blocked",
  running: "Running",
};

const numberFormatter = new Intl.NumberFormat("en-US");
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatTokens(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return numberFormatter.format(value);
}

function formatDate(value: string) {
  if (value === "unknown") return "unknown";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
}

export default function Home() {
  const stats = getProjectStats();
  const autonomousStats = getAutonomousStats();
  const autonomousTickets = getAutonomousTickets().slice(0, 6);
  const workerRuns = getAutonomousWorkerRuns().slice(0, 4);
  const urgentAlerts = getUrgentAlerts();
  const budget = getBudgetSnapshot(autonomousState);
  const budgetPlan = getPrioritizedTicketPlan(autonomousState).slice(0, 5);
  const budgetPlanById = new Map(budgetPlan.map((ticket) => [ticket.id, ticket]));
  const topAlerts = [...urgentAlerts, ...alerts.filter((alert) => alert.severity !== "success")].slice(0, 4);
  const hourlyActivity = getHourlyActivity();

  return (
    <main className="cockpit-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Hermes Cockpit</p>
          <h1>One cockpit for all your Hermes-powered projects.</h1>
          <p className="hero-copy">
            Track projects, autonomous workers, pending tasks, alerts, deployments, and agent reports from a single open-source dashboard built for Hermes Agent users.
          </p>
          <div className="hero-actions">
            <a href="https://github.com/goktugozdem2/hermes-cockpit" className="button primary">View on GitHub</a>
            <a href="#projects" className="button secondary">Open projects</a>
          </div>
        </div>
        <div className="status-orb" aria-label="Cockpit health summary">
          <span>{stats.activeAgents}</span>
          <small>active agents</small>
        </div>
      </section>

      <section className="stats-grid" aria-label="Global status">
        <article><span>{stats.totalProjects}</span><small>projects</small></article>
        <article><span>{autonomousStats.runningWorkers}</span><small>autonomous workers</small></article>
        <article><span>{autonomousStats.openTickets}</span><small>live tickets</small></article>
        <article><span>{autonomousStats.urgentAlerts}</span><small>urgent alerts</small></article>
      </section>

      <section className="panel autonomous-panel">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">Autonomous Orchestrator</p>
            <h2>Continuous ticket engine</h2>
          </div>
          <p className="muted">
            Mode: {autonomousState.mode} · Policy: {autonomousState.notificationPolicy} · Last update: {autonomousState.updatedAt}
          </p>
        </div>
        <div className="automation-grid">
          <article>
            <span>{autonomousStats.p0Tickets}</span>
            <small>P0 tickets</small>
          </article>
          <article>
            <span>{autonomousStats.runningWorkers}</span>
            <small>running workers</small>
          </article>
          <article>
            <span>{autonomousStats.openTickets}</span>
            <small>open autonomous tickets</small>
          </article>
        </div>
      </section>

      <section className="panel budget-panel" id="budget-guardian">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">Budget Guardian</p>
            <h2>Token and cost-aware planning</h2>
          </div>
          <p className="muted">
            Monthly cap: {currencyFormatter.format(budget.monthlyBudgetUsd)} · Reset: {formatDate(budget.resetAt)} · Source: {budget.source}
          </p>
        </div>
        <div className="budget-summary-grid">
          <article>
            <span>{currencyFormatter.format(budget.usedUsd)}</span>
            <small>spent this month</small>
          </article>
          <article>
            <span>{currencyFormatter.format(budget.remainingBudgetUsd)}</span>
            <small>{budget.remainingPercent}% budget left</small>
          </article>
          <article>
            <span>{formatTokens(budget.usedTokens)}</span>
            <small>{budget.tokenUsedPercent}% tokens burned</small>
          </article>
          <article>
            <span>{formatTokens(budget.remainingTokens)}</span>
            <small>tokens left</small>
          </article>
        </div>
        <div className="budget-meter" aria-label={`Budget used ${budget.usedPercent}%`}>
          <span style={{ width: `${Math.min(budget.usedPercent, 100)}%` }} />
        </div>
        <div className="budget-plan">
          {budgetPlan.map((ticket) => (
            <article className="budget-ticket" key={ticket.id}>
              <div>
                <span className={`recommendation ${ticket.recommendation}`}>{ticket.recommendation}</span>
                <h3>{ticket.id}: {ticket.title}</h3>
                <p>{formatTokens(ticket.estimatedTokens.total)} tokens · {currencyFormatter.format(ticket.estimatedCostUsd)} est. · {ticket.remainingBudgetImpactPercent}% of remaining budget</p>
              </div>
              <span className={`budget-risk ${ticket.risk}`}>{ticket.risk}</span>
            </article>
          ))}
        </div>
      </section>

      <CeoUsageDashboard activity={hourlyActivity} projects={projects} source={budget.source} />

      <section className="panel-grid">
        <div className="panel wide" id="projects">
          <div className="section-heading">
            <p className="eyebrow">Projects</p>
            <h2>Mission board</h2>
          </div>
          <div className="project-grid">
            {projects.map((project) => (
              <Link href={`/projects/${project.slug}`} className="project-card" key={project.id}>
                <div className="card-topline">
                  <span className={`status-pill ${project.status}`}>{statusLabels[project.status]}</span>
                  <span className="health-score">{project.healthScore}%</span>
                </div>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <dl className="project-metrics">
                  <div><dt>Agents</dt><dd>{project.activeAgents}</dd></div>
                  <div><dt>Pending</dt><dd>{project.pendingTasks}</dd></div>
                  <div><dt>Blocked</dt><dd>{project.blockedTasks}</dd></div>
                  <div><dt>Checks</dt><dd>{project.failingChecks}</dd></div>
                </dl>
                <div className="tag-row">
                  {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="panel">
          <div className="section-heading">
            <p className="eyebrow">Alerts</p>
            <h2>Needs attention</h2>
          </div>
          <div className="alert-list">
            {topAlerts.map((alert) => (
              <article className={`alert-item ${alert.severity}`} key={alert.id}>
                <span>{"source" in alert ? alert.source : "Orchestrator"}</span>
                <h3>{alert.title}</h3>
                <p>{alert.body}</p>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className="panel-grid">
        <div className="panel wide">
          <div className="section-heading">
            <p className="eyebrow">Live tickets</p>
            <h2>Autonomous work queue</h2>
          </div>
          <div className="ticket-list">
            {autonomousTickets.map((ticket) => (
              <article className="ticket-row" key={ticket.id}>
                <span className={`priority ${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                <div>
                  <h3>{ticket.id}: {ticket.title}</h3>
                  <p>{ticket.projectSlug} · {ticket.owner} · {ticket.status.replace("_", " ")}</p>
                  <small>{ticket.nextAction}</small>
                  {budgetPlanById.get(ticket.id) && (
                    <div className="ticket-spend">
                      {formatTokens(budgetPlanById.get(ticket.id)!.estimatedTokens.total)} tokens · {currencyFormatter.format(budgetPlanById.get(ticket.id)!.estimatedCostUsd)} est. · {budgetPlanById.get(ticket.id)!.recommendation}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
        <aside className="panel">
          <div className="section-heading">
            <p className="eyebrow">Workers</p>
            <h2>Heartbeats</h2>
          </div>
          <div className="agent-list">
            {workerRuns.map((run) => (
              <article className="agent-row" key={run.id}>
                <span className={`status-dot ${run.status}`} />
                <div>
                  <h3>{run.worker}</h3>
                  <p>{run.ticketId} · {run.summary}</p>
                  <small>Heartbeat: {run.lastHeartbeat}</small>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className="panel">
        <div className="section-heading">
          <p className="eyebrow">Open work</p>
          <h2>Cross-project task queue</h2>
        </div>
        <div className="task-list">
          {tasks.map((task) => (
            <article className="task-row" key={task.id}>
              <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
              <div>
                <h3>{task.title}</h3>
                <p>{task.projectSlug} · {task.owner} · {task.status.replace("_", " ")}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
