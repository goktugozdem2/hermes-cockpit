import Link from "next/link";
import { CeoUsageDashboard } from "@/components/ceo-usage-dashboard";
import { alerts, getProjectAnalytics, projects } from "@/lib/cockpit-data";
import {
  autonomousState,
  getAutonomousStats,
  getAutonomousTickets,
  getHourlyActivity,
  getUrgentAlerts,
} from "@/lib/autonomous-state";
import { getBudgetSnapshot } from "@/lib/budget-agent";

const statusLabels = {
  healthy: "Healthy",
  warning: "Warning",
  blocked: "Blocked",
  running: "Running",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatMetric(value: number | null, suffix = "") {
  if (value === null) return "—";
  return `${value}${suffix}`;
}

function productPulseForProject(projectSlug: string) {
  const analytics = getProjectAnalytics(projectSlug);
  if (!analytics) return "Analytics not connected";
  if (analytics.connectionStatus === "not_launched") {
    return `${formatMetric(analytics.todayUsers)} today · ${formatMetric(analytics.weeklyActiveUsers)} WAU · no paid users`;
  }
  if (analytics.connectionStatus !== "live") return analytics.sourceLabel;
  return `${formatMetric(analytics.todayUsers)} today · ${formatMetric(analytics.weeklyActiveUsers)} WAU · ${formatMetric(analytics.newSignups)} signups`;
}

function paidUsersForProject(projectSlug: string) {
  const analytics = getProjectAnalytics(projectSlug);
  if (!analytics) return "Billing pending";
  if (analytics.paidUsers.length === 0) {
    return analytics.connectionStatus === "live" ? "No Pro users" : "Pro usernames pending";
  }
  return analytics.paidUsers.map((user) => `@${user.username}`).join(", ");
}

function verdictForProject(projectSlug: string) {
  const analytics = getProjectAnalytics(projectSlug);
  if (analytics?.verdict) return analytics.verdict;
  if (projectSlug === "gorucu") return "Push growth";
  if (projectSlug === "sqlquest") return "Fix growth pipeline";
  if (projectSlug === "tercihai") return "Validate safety";
  if (projectSlug === "hermes-cockpit") return "Ship dashboard";
  return "Keep moving";
}

function healthSentence(averageHealth: number, attentionCount: number) {
  if (attentionCount > 2) return "Mostly healthy. A few decisions need attention.";
  if (averageHealth >= 85) return "Everything is mostly healthy.";
  if (averageHealth >= 75) return "Healthy, but not quiet.";
  return "Needs attention today.";
}

export default function Home() {
  const autonomousStats = getAutonomousStats();
  const autonomousTickets = getAutonomousTickets().slice(0, 5);
  const urgentAlerts = getUrgentAlerts();
  const topAlerts = [...urgentAlerts, ...alerts.filter((alert) => alert.severity !== "success")].slice(0, 3);
  const budget = getBudgetSnapshot(autonomousState);
  const hourlyActivity = getHourlyActivity();
  const totalWorkUnits = hourlyActivity.reduce((sum, hour) => sum + hour.totalWorkUnits, 0);
  const averageHealth = Math.round(projects.reduce((sum, project) => sum + project.healthScore, 0) / projects.length);
  const blockedTasks = projects.reduce((sum, project) => sum + project.blockedTasks, 0);
  const attentionCount = topAlerts.length + blockedTasks;
  const todayLine = healthSentence(averageHealth, attentionCount);

  const projectRows = projects
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

      return {
        project,
        ...totals,
        pulse: productPulseForProject(project.slug),
        paidUsers: paidUsersForProject(project.slug),
        verdict: verdictForProject(project.slug),
      };
    })
    .sort((a, b) => b.tokens - a.tokens);

  const nextDecision = autonomousState.tickets.find((ticket) => ticket.projectSlug === "tercihai") ?? autonomousTickets[0];
  const founderAttention = [
    nextDecision ? `Approve: ${nextDecision.title}` : "Review today's product priorities",
    "Decide SQL Quest influencer outreach priority",
    "Review Görücü beta positioning",
  ].slice(0, 3);

  return (
    <main className="cockpit-shell jobs-shell">
      <section className="jobs-hero" aria-label="Steve Jobs style CEO dashboard snapshot">
        <p className="jobs-kicker">Today · CEO Dashboard</p>
        <h1>{todayLine}</h1>
        <p className="jobs-summary">
          AI spend is under control. Execution is active. TercihAI needs one safety decision.
        </p>

        <div className="jobs-snapshot-grid" aria-label="Today CEO Snapshot">
          <article>
            <span>Health</span>
            <strong>{averageHealth}%</strong>
            <small>{projects.length} projects, {topAlerts.length} alerts</small>
          </article>
          <article>
            <span>Spend</span>
            <strong>{currencyFormatter.format(budget.usedUsd)}</strong>
            <small>{budget.remainingPercent}% budget left</small>
          </article>
          <article>
            <span>Work</span>
            <strong>{totalWorkUnits}</strong>
            <small>units completed</small>
          </article>
          <article>
            <span>Risk</span>
            <strong>{blockedTasks}</strong>
            <small>blocked tasks</small>
          </article>
          <article className="next-action-card">
            <span>Next</span>
            <strong>TercihAI safety</strong>
            <small>Approve metrics</small>
          </article>
        </div>
      </section>

      <section className="jobs-attention" aria-label="Needs Can today">
        <div>
          <p className="jobs-kicker">Needs Can</p>
          <h2>Three decisions. Nothing else.</h2>
        </div>
        <ol>
          {founderAttention.map((item) => <li key={item}>{item}</li>)}
        </ol>
      </section>

      <CeoUsageDashboard activity={hourlyActivity} projects={projects} source={budget.source} />

      <section className="jobs-section jobs-projects" id="projects" aria-label="Product pulse dashboard">
        <div className="jobs-section-heading">
          <p className="jobs-kicker">Product Pulse</p>
          <h2>Real users only. No fake traction.</h2>
        </div>
        <div className="jobs-project-list">
          {projectRows.map(({ project, costUsd, pulse, paidUsers, verdict }) => (
            <Link href={`/projects/${project.slug}`} className="jobs-project-row product-pulse-row" key={project.slug}>
              <div>
                <strong>{project.name}</strong>
                <small>{statusLabels[project.status]}</small>
              </div>
              <div>
                <span>{pulse}</span>
                <small>Today · WAU · signups/churn when live</small>
              </div>
              <div>
                <span>{paidUsers}</span>
                <small>Pro users by username</small>
              </div>
              <div>
                <span>{currencyFormatter.format(costUsd)}</span>
                <small>AI spend estimate</small>
              </div>
              <em>{verdict}</em>
            </Link>
          ))}
        </div>
      </section>

      <section className="jobs-section jobs-execution" aria-label="Execution dashboard">
        <div className="jobs-section-heading">
          <p className="jobs-kicker">Execution</p>
          <h2>Is the machine moving?</h2>
        </div>
        <div className="jobs-execution-grid">
          <article><span>Workers</span><strong>{autonomousStats.runningWorkers}</strong><small>running now</small></article>
          <article><span>Open</span><strong>{autonomousStats.openTickets}</strong><small>tickets</small></article>
          <article><span>P0</span><strong>{autonomousStats.p0Tickets}</strong><small>critical</small></article>
          <article><span>Alerts</span><strong>{topAlerts.length}</strong><small>need attention</small></article>
        </div>
        <div className="jobs-alert-strip">
          {topAlerts.map((alert) => (
            <article key={alert.id}>
              <span>{"source" in alert ? alert.source : "Orchestrator"}</span>
              <strong>{alert.title}</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
