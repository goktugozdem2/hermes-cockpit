import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectDetails, projects } from "@/lib/cockpit-data";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const details = getProjectDetails(slug);

  if (!details.project) {
    notFound();
  }

  const { project } = details;

  return (
    <main className="cockpit-shell project-detail-shell">
      <Link href="/" className="back-link">← Back to cockpit</Link>

      <section className="hero-panel compact">
        <div>
          <p className="eyebrow">Project detail</p>
          <h1>{project.name}</h1>
          <p className="hero-copy">{project.focus}</p>
          <div className="tag-row large">
            {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </div>
        <div className="status-orb">
          <span>{project.healthScore}%</span>
          <small>{project.status}</small>
        </div>
      </section>

      <section className="stats-grid">
        <article><span>{project.activeAgents}</span><small>active agents</small></article>
        <article><span>{project.pendingTasks}</span><small>pending tasks</small></article>
        <article><span>{project.blockedTasks}</span><small>blocked tasks</small></article>
        <article><span>{project.lastDeploy}</span><small>last deploy</small></article>
      </section>

      <section className="panel-grid">
        <div className="panel">
          <div className="section-heading">
            <p className="eyebrow">Agents</p>
            <h2>Worker state</h2>
          </div>
          <div className="agent-list">
            {details.agentRuns.map((run) => (
              <article className="agent-row" key={run.id}>
                <span className={`status-dot ${run.status}`} />
                <div>
                  <h3>{run.name}</h3>
                  <p>{run.currentTask}</p>
                  <small>Heartbeat: {run.lastHeartbeat}</small>
                </div>
              </article>
            ))}
            {details.agentRuns.length === 0 && <p className="muted">No active agent reports yet.</p>}
          </div>
        </div>

        <div className="panel">
          <div className="section-heading">
            <p className="eyebrow">Alerts</p>
            <h2>Project warnings</h2>
          </div>
          <div className="alert-list">
            {details.alerts.map((alert) => (
              <article className={`alert-item ${alert.severity}`} key={alert.id}>
                <span>{alert.source}</span>
                <h3>{alert.title}</h3>
                <p>{alert.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel-grid">
        <div className="panel">
          <div className="section-heading">
            <p className="eyebrow">Tasks</p>
            <h2>Next work</h2>
          </div>
          <div className="task-list compact-list">
            {details.tasks.map((task) => (
              <article className="task-row" key={task.id}>
                <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.owner} · {task.status.replace("_", " ")}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="section-heading">
            <p className="eyebrow">Timeline</p>
            <h2>Recent events</h2>
          </div>
          <div className="timeline-list">
            {details.timeline.map((event) => (
              <article className={`timeline-item ${event.severity}`} key={event.id}>
                <span>{event.type}</span>
                <h3>{event.title}</h3>
                <p>{event.body}</p>
                <small>{event.createdAt}</small>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
