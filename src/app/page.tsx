import Link from "next/link";
import { CeoUsageDashboard } from "@/components/ceo-usage-dashboard";
import { alerts, getProjectStats, projects } from "@/lib/cockpit-data";
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

function projectShare(projectTokens: number, totalTokens: number) {
  if (totalTokens <= 0) return 0;
  return Math.round((projectTokens / totalTokens) * 100);
}

export default function Home() {
  const stats = getProjectStats();
  const autonomousStats = getAutonomousStats();
  const autonomousTickets = getAutonomousTickets().slice(0, 6);
  const workerRuns = getAutonomousWorkerRuns().slice(0, 4);
  const urgentAlerts = getUrgentAlerts();
  const budget = getBudgetSnapshot(autonomousState);
  const budgetPlan = getPrioritizedTicketPlan(autonomousState).slice(0, 5);
  const topAlerts = [...urgentAlerts, ...alerts.filter((alert) => alert.severity !== "success")].slice(0, 5);
  const hourlyActivity = getHourlyActivity();
  const totalHourlyTokens = hourlyActivity.reduce((sum, hour) => sum + hour.totalTokens, 0);
  const projectBurn = projects
    .map((project) => {
      const totals = hourlyActivity.reduce(
        (sum, hour) => {
          const row = hour.projects.find((item) => item.projectSlug === project.slug);
          if (!row) return sum;
          return {
            tokens: sum.tokens + row.inputTokens + row.outputTokens,
            costUsd: sum.costUsd + row.costUsd,
            workUnits: sum.workUnits + row.workUnits,
          };
        },
        { tokens: 0, costUsd: 0, workUnits: 0 },
      );

      return { project, ...totals };
    })
    .sort((a, b) => b.tokens - a.tokens);

  const highestBurnProject = projectBurn.at(0);
  const openTicketsByProject = projects.map((project) => ({
    project,
    tickets: autonomousState.tickets.filter((ticket) => ticket.projectSlug === project.slug && ticket.status !== "completed").length,
    workers: workerRuns.filter((run) => run.projectSlug === project.slug && run.status === "running").length,
  }));

  return (
    <main className="cockpit-shell dashboard-only-shell">
      <section className="dashboard-page-title" aria-label="Homepage dashboard collection">
        <p className="eyebrow">CEO Cockpit · dashboards only</p>
        <h1>Portfolio operating dashboards</h1>
        <p>
          The homepage is limited to executive dashboards: usage, portfolio health, AI runway, and execution control. No marketing hero, no generic lists.
        </p>
      </section>

      <CeoUsageDashboard activity={hourlyActivity} projects={projects} source={budget.source} />

      <section className="panel tableau-dashboard portfolio-dashboard" id="portfolio-health-dashboard" aria-label="Portfolio health dashboard">
        <div className="tableau-title-row">
          <div>
            <p className="eyebrow">Portfolio Health Dashboard · Tableau-style workbook</p>
            <h2>Product health control center</h2>
            <p className="tableau-subtitle">Purpose-built for the executive question: which product is healthy, blocked, under-resourced, or becoming expensive?</p>
          </div>
          <div className="tableau-source-card">
            <span>Portfolio</span>
            <strong>{stats.totalProjects} active projects</strong>
            <small>{stats.criticalAlerts} warnings / criticals</small>
          </div>
        </div>

        <div className="dashboard-kpi-grid">
          <article><span>Average health</span><strong>{Math.round(projects.reduce((sum, project) => sum + project.healthScore, 0) / projects.length)}%</strong><small>Across all tracked products</small></article>
          <article><span>Active agents</span><strong>{projects.reduce((sum, project) => sum + project.activeAgents, 0)}</strong><small>Working across portfolio</small></article>
          <article><span>Blocked tasks</span><strong>{projects.reduce((sum, project) => sum + project.blockedTasks, 0)}</strong><small>Needs founder/operator action</small></article>
          <article><span>Top burner</span><strong>{highestBurnProject?.project.name ?? "n/a"}</strong><small>{highestBurnProject ? `${formatTokens(highestBurnProject.tokens)} tokens` : "No burn data"}</small></article>
        </div>

        <div className="workbook-grid three-two">
          <article className="worksheet-card span-two">
            <div className="worksheet-heading">
              <span>Worksheet 2</span>
              <h3>Project health and burn ranking</h3>
              <p>Each row combines product health, status, work pressure, and recent token share.</p>
            </div>
            <div className="portfolio-table">
              {projectBurn.map(({ project, tokens, costUsd, workUnits }) => (
                <Link href={`/projects/${project.slug}`} className="portfolio-row" key={project.slug}>
                  <div>
                    <span className={`status-pill ${project.status}`}>{statusLabels[project.status]}</span>
                    <strong>{project.name}</strong>
                    <small>{project.focus}</small>
                  </div>
                  <div className="health-bar" aria-label={`${project.name} health ${project.healthScore}%`}><span style={{ width: `${project.healthScore}%` }} /></div>
                  <div><strong>{project.healthScore}%</strong><small>health</small></div>
                  <div><strong>{formatTokens(tokens)}</strong><small>{projectShare(tokens, totalHourlyTokens)}% token share</small></div>
                  <div><strong>{currencyFormatter.format(costUsd)}</strong><small>{workUnits} work units</small></div>
                </Link>
              ))}
            </div>
          </article>

          <aside className="worksheet-card insight-card">
            <div className="worksheet-heading">
              <span>Insight</span>
              <h3>Executive readout</h3>
            </div>
            <div className="insight-list">
              <article><strong>Highest burn:</strong> {highestBurnProject?.project.name ?? "n/a"} leads recent token usage.</article>
              <article><strong>Attention:</strong> {topAlerts.length} active alerts are visible in the operating layer.</article>
              <article><strong>Rule:</strong> prioritize low-health + high-burn products first.</article>
            </div>
          </aside>
        </div>
      </section>

      <section className="panel tableau-dashboard runway-dashboard" id="ai-runway-dashboard" aria-label="AI spend and runway dashboard">
        <div className="tableau-title-row">
          <div>
            <p className="eyebrow">AI Spend & Runway Dashboard · Tableau-style workbook</p>
            <h2>Budget guardian control center</h2>
            <p className="tableau-subtitle">Purpose-built for the executive question: how much budget is left, which planned work can auto-run, and which work needs review?</p>
          </div>
          <div className="tableau-source-card">
            <span>Monthly cap</span>
            <strong>{currencyFormatter.format(budget.monthlyBudgetUsd)}</strong>
            <small>Reset {formatDate(budget.resetAt)} · {budget.source}</small>
          </div>
        </div>

        <div className="dashboard-kpi-grid">
          <article><span>Spent</span><strong>{currencyFormatter.format(budget.usedUsd)}</strong><small>{budget.usedPercent}% of monthly budget</small></article>
          <article><span>Runway left</span><strong>{currencyFormatter.format(budget.remainingBudgetUsd)}</strong><small>{budget.remainingPercent}% remaining</small></article>
          <article><span>Token burn</span><strong>{formatTokens(budget.usedTokens)}</strong><small>{budget.tokenUsedPercent}% of token cap</small></article>
          <article><span>Tokens left</span><strong>{formatTokens(budget.remainingTokens)}</strong><small>Policy-aware execution buffer</small></article>
        </div>

        <div className="budget-meter workbook-meter" aria-label={`Budget used ${budget.usedPercent}%`}>
          <span style={{ width: `${Math.min(budget.usedPercent, 100)}%` }} />
        </div>

        <div className="workbook-grid">
          <article className="worksheet-card">
            <div className="worksheet-heading">
              <span>Worksheet 3</span>
              <h3>Planned ticket spend</h3>
              <p>Budget policy estimates before autonomous workers spend more tokens.</p>
            </div>
            <div className="budget-plan compact-plan">
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
          </article>

          <aside className="worksheet-card insight-card">
            <div className="worksheet-heading">
              <span>Policy</span>
              <h3>Runway readout</h3>
            </div>
            <div className="insight-list">
              <article><strong>Auto-run:</strong> low-cost tickets can proceed without interrupting Telegram.</article>
              <article><strong>Review:</strong> medium/high cost tickets stay visible before spend.</article>
              <article><strong>Caveat:</strong> provider billing sync is pending; this is cockpit planning data.</article>
            </div>
          </aside>
        </div>
      </section>

      <section className="panel tableau-dashboard execution-dashboard" id="execution-control-dashboard" aria-label="Execution control dashboard">
        <div className="tableau-title-row">
          <div>
            <p className="eyebrow">Execution Control Dashboard · Tableau-style workbook</p>
            <h2>Autonomous work command center</h2>
            <p className="tableau-subtitle">Purpose-built for the executive question: what is running, what is blocked, and what requires founder attention now?</p>
          </div>
          <div className="tableau-source-card">
            <span>Operating mode</span>
            <strong>{autonomousState.mode}</strong>
            <small>{autonomousState.notificationPolicy} · updated {autonomousState.updatedAt}</small>
          </div>
        </div>

        <div className="dashboard-kpi-grid">
          <article><span>P0 tickets</span><strong>{autonomousStats.p0Tickets}</strong><small>Highest priority work</small></article>
          <article><span>Running workers</span><strong>{autonomousStats.runningWorkers}</strong><small>Current autonomous activity</small></article>
          <article><span>Open tickets</span><strong>{autonomousStats.openTickets}</strong><small>Execution backlog</small></article>
          <article><span>Alerts</span><strong>{topAlerts.length}</strong><small>Visible attention items</small></article>
        </div>

        <div className="workbook-grid three-two">
          <article className="worksheet-card span-two">
            <div className="worksheet-heading">
              <span>Worksheet 4</span>
              <h3>Execution queue by project</h3>
              <p>Open ticket pressure and active worker allocation across the portfolio.</p>
            </div>
            <div className="execution-matrix">
              {openTicketsByProject.map(({ project, tickets, workers }) => (
                <article key={project.slug}>
                  <strong>{project.name}</strong>
                  <div className="execution-bars">
                    <span style={{ width: `${Math.min(tickets * 16, 100)}%` }} />
                    <span style={{ width: `${Math.min(workers * 40, 100)}%` }} />
                  </div>
                  <small>{tickets} open tickets · {workers} running workers</small>
                </article>
              ))}
            </div>
          </article>

          <aside className="worksheet-card insight-card">
            <div className="worksheet-heading">
              <span>Attention</span>
              <h3>Risk and blocker radar</h3>
            </div>
            <div className="alert-list dashboard-alert-list">
              {topAlerts.map((alert) => (
                <article className={`alert-item ${alert.severity}`} key={alert.id}>
                  <span>{"source" in alert ? alert.source : "Orchestrator"}</span>
                  <h3>{alert.title}</h3>
                  <p>{alert.body}</p>
                </article>
              ))}
            </div>
          </aside>
        </div>

        <div className="worksheet-card full-width-card">
          <div className="worksheet-heading">
            <span>Worksheet 5</span>
            <h3>Live autonomous ticket ledger</h3>
            <p>Recent actionable work only; detailed project pages remain one click away.</p>
          </div>
          <div className="ticket-list dashboard-ticket-list">
            {autonomousTickets.map((ticket) => (
              <article className="ticket-row" key={ticket.id}>
                <span className={`priority ${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                <div>
                  <h3>{ticket.id}: {ticket.title}</h3>
                  <p>{ticket.projectSlug} · {ticket.owner} · {ticket.status.replace("_", " ")}</p>
                  <small>{ticket.nextAction}</small>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
