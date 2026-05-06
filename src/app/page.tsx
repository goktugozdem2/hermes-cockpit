import Link from "next/link";
import { alerts, getProjectStats, projects, tasks } from "@/lib/cockpit-data";
import {
  autonomousState,
  getAutonomousStats,
  getAutonomousTickets,
  getAutonomousWorkerRuns,
  getUrgentAlerts,
} from "@/lib/autonomous-state";
import { getBudgetSnapshot, getPrioritizedTicketPlan } from "@/lib/budget-agent";

const statusLabels = {
  healthy: "Healthy",
  warning: "Warning",
  blocked: "Blocked",
  running: "Running",
};

export default function Home() {
  const stats = getProjectStats();
  const autonomousStats = getAutonomousStats();
  const autonomousTickets = getAutonomousTickets().slice(0, 6);
  const workerRuns = getAutonomousWorkerRuns().slice(0, 4);
  const urgentAlerts = getUrgentAlerts();
  const budget = getBudgetSnapshot(autonomousState);
  const budgetPlan = getPrioritizedTicketPlan(autonomousState).slice(0, 5);
  const topAlerts = [...urgentAlerts, ...alerts.filter((alert) => alert.severity !== "success")].slice(0, 4);

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
