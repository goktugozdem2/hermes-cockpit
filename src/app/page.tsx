import Link from "next/link";
import { alerts, getProjectStats, projects, tasks } from "@/lib/cockpit-data";

const statusLabels = {
  healthy: "Healthy",
  warning: "Warning",
  blocked: "Blocked",
  running: "Running",
};

export default function Home() {
  const stats = getProjectStats();
  const topAlerts = alerts.filter((alert) => alert.severity !== "success").slice(0, 4);

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
        <article><span>{stats.warningProjects}</span><small>need attention</small></article>
        <article><span>{stats.pendingTasks}</span><small>open tasks</small></article>
        <article><span>{stats.criticalAlerts}</span><small>alerts</small></article>
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
                <span>{alert.source}</span>
                <h3>{alert.title}</h3>
                <p>{alert.body}</p>
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
