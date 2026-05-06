import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectDetails, projects } from "@/lib/cockpit-data";
import { getAutonomousTickets, getAutonomousWorkerRuns, getUrgentAlerts } from "@/lib/autonomous-state";

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
  const autonomousTickets = getAutonomousTickets(slug);
  const autonomousWorkerRuns = getAutonomousWorkerRuns(slug);
  const urgentAlerts = getUrgentAlerts(slug);

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
        <article><span>{project.activeAgents + autonomousWorkerRuns.length}</span><small>active agents</small></article>
        <article><span>{project.pendingTasks + autonomousTickets.filter((ticket) => ticket.status !== "completed").length}</span><small>pending tasks</small></article>
        <article><span>{project.blockedTasks + autonomousTickets.filter((ticket) => ticket.status === "blocked").length}</span><small>blocked tasks</small></article>
        <article><span>{urgentAlerts.length}</span><small>urgent alerts</small></article>
      </section>

      {details.architecture && (
        <section className="panel architecture-panel">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Architecture</p>
              <h2>Who is involved</h2>
            </div>
            <p className="muted">{details.architecture.summary}</p>
          </div>
          <div className="architecture-map">
            {details.architecture.nodes.map((node) => (
              <article className={`architecture-node ${node.role}`} key={node.id}>
                <span>{node.role}</span>
                <h3>{node.name}</h3>
                <p>{node.responsibility}</p>
                <small>{node.status}</small>
              </article>
            ))}
          </div>
          <div className="relationship-list">
            {details.architecture.relationships.map((relationship) => {
              const from = details.architecture?.nodes.find((node) => node.id === relationship.from)?.name ?? relationship.from;
              const to = details.architecture?.nodes.find((node) => node.id === relationship.to)?.name ?? relationship.to;

              return (
                <div className="relationship-row" key={relationship.id}>
                  <b>{from}</b>
                  <span>→ {relationship.label} →</span>
                  <b>{to}</b>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="panel-grid">
        <div className="panel wide">
          <div className="section-heading">
            <p className="eyebrow">Autonomous tickets</p>
            <h2>Live project queue</h2>
          </div>
          <div className="ticket-list compact-list">
            {autonomousTickets.map((ticket) => (
              <article className="ticket-row" key={ticket.id}>
                <span className={`priority ${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                <div>
                  <h3>{ticket.id}: {ticket.title}</h3>
                  <p>{ticket.owner} · {ticket.status.replace("_", " ")} · {ticket.source}</p>
                  <small>{ticket.nextAction}</small>
                </div>
              </article>
            ))}
            {autonomousTickets.length === 0 && <p className="muted">No autonomous tickets for this project yet.</p>}
          </div>
        </div>

        <aside className="panel">
          <div className="section-heading">
            <p className="eyebrow">Urgent channel</p>
            <h2>Telegram interrupts</h2>
          </div>
          <div className="alert-list">
            {urgentAlerts.map((alert) => (
              <article className={`alert-item ${alert.severity}`} key={alert.id}>
                <span>Orchestrator</span>
                <h3>{alert.title}</h3>
                <p>{alert.body}</p>
              </article>
            ))}
            {urgentAlerts.length === 0 && <p className="muted">No urgent Telegram interruptions. Normal work stays in the panel.</p>}
          </div>
        </aside>
      </section>

      <section className="panel-grid">
        <div className="panel">
          <div className="section-heading">
            <p className="eyebrow">Agents</p>
            <h2>Worker state</h2>
          </div>
          <div className="agent-list">
            {autonomousWorkerRuns.map((run) => (
              <article className="agent-row" key={run.id}>
                <span className={`status-dot ${run.status}`} />
                <div>
                  <h3>{run.worker}</h3>
                  <p>{run.ticketId} · {run.summary}</p>
                  <small>Heartbeat: {run.lastHeartbeat}</small>
                </div>
              </article>
            ))}
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
            {details.agentRuns.length === 0 && autonomousWorkerRuns.length === 0 && <p className="muted">No active agent reports yet.</p>}
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
