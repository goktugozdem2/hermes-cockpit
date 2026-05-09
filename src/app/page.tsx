import Link from "next/link";
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

function buildLinePath(values: number[], width = 720, height = 220) {
  if (values.length === 0) return "";

  const max = Math.max(...values, 1);
  const step = values.length > 1 ? width / (values.length - 1) : width;
  return values
    .map((value, index) => {
      const x = Math.round(index * step);
      const y = Math.round(height - (value / max) * height);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

function chartPoints(values: number[], width = 720, height = 220) {
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? width / (values.length - 1) : width;

  return values.map((value, index) => ({
    x: Math.round(index * step),
    y: Math.round(height - (value / max) * height),
    value,
  }));
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
  const hourlyTokenValues = hourlyActivity.map((hour) => hour.totalTokens);
  const hourlyWorkValues = hourlyActivity.map((hour) => hour.totalWorkUnits);
  const tokenLinePath = buildLinePath(hourlyTokenValues);
  const workLinePath = buildLinePath(hourlyWorkValues);
  const tokenPoints = chartPoints(hourlyTokenValues);
  const workPoints = chartPoints(hourlyWorkValues);
  const hourlyTotals = hourlyActivity.reduce(
    (totals, hour) => ({
      workUnits: totals.workUnits + hour.totalWorkUnits,
      tokens: totals.tokens + hour.totalTokens,
      costUsd: totals.costUsd + hour.totalCostUsd,
    }),
    { workUnits: 0, tokens: 0, costUsd: 0 },
  );
  const projectHourlyTotals = projects.map((project) => {
    const projectRows = hourlyActivity.flatMap((hour) => hour.projects.filter((row) => row.projectSlug === project.slug));

    return {
      project,
      workUnits: projectRows.reduce((sum, row) => sum + row.workUnits, 0),
      tokens: projectRows.reduce((sum, row) => sum + row.inputTokens + row.outputTokens, 0),
      costUsd: projectRows.reduce((sum, row) => sum + row.costUsd, 0),
    };
  });

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

      <section className="panel activity-panel" id="hourly-activity">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">Live hourly activity</p>
            <h2>Work done and token burn by hour</h2>
          </div>
          <p className="muted">
            Visualizes all projects per hour. Current source is cockpit state + planning estimates; provider billing sync is still pending.
          </p>
        </div>

        <div className="activity-summary-grid">
          <article><span>{hourlyTotals.workUnits}</span><small>work units in window</small></article>
          <article><span>{formatTokens(hourlyTotals.tokens)}</span><small>tokens burned</small></article>
          <article><span>{currencyFormatter.format(hourlyTotals.costUsd)}</span><small>estimated cost</small></article>
          <article><span>{hourlyActivity.at(-1)?.label ?? "—"}</span><small>latest hour</small></article>
        </div>

        <div className="chart-card" aria-label="Hourly work and token line chart">
          <div className="chart-legend">
            <span className="legend-token">Tokens</span>
            <span className="legend-work">Work units</span>
          </div>
          <svg className="line-chart" viewBox="0 0 720 260" role="img" aria-label="Line chart showing hourly token burn and work done">
            {[0, 1, 2, 3].map((line) => (
              <line key={line} x1="0" x2="720" y1={line * 70 + 10} y2={line * 70 + 10} className="chart-grid-line" />
            ))}
            <g transform="translate(0 16)">
              <path d={tokenLinePath} className="chart-line token-line" />
              <path d={workLinePath} className="chart-line work-line" />
              {tokenPoints.map((point, index) => (
                <circle key={`token-${hourlyActivity[index]?.hour}`} cx={point.x} cy={point.y} r="5" className="chart-point token-point">
                  <title>{hourlyActivity[index]?.label}: {formatTokens(point.value)} tokens</title>
                </circle>
              ))}
              {workPoints.map((point, index) => (
                <circle key={`work-${hourlyActivity[index]?.hour}`} cx={point.x} cy={point.y} r="4" className="chart-point work-point">
                  <title>{hourlyActivity[index]?.label}: {point.value} work units</title>
                </circle>
              ))}
            </g>
          </svg>
          <div className="chart-axis">
            {hourlyActivity.map((hour) => <span key={hour.hour}>{hour.label}</span>)}
          </div>
        </div>

        <div className="project-activity-grid">
          {projectHourlyTotals.map(({ project, workUnits, tokens, costUsd }) => (
            <article className="project-activity-card" key={project.id}>
              <span className={`status-pill ${project.status}`}>{project.name}</span>
              <strong>{formatTokens(tokens)} tokens</strong>
              <small>{workUnits} work units · {currencyFormatter.format(costUsd)} est.</small>
            </article>
          ))}
        </div>
      </section>

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
