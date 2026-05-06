import autonomousStateJson from "../../data/autonomous-state.json";

export type AutonomousTicketStatus = "pending" | "in_progress" | "blocked" | "completed";
export type AutonomousPriority = "P0" | "P1" | "P2" | "P3";
export type AutonomousWorkerStatus = "running" | "completed" | "waiting" | "failed";
export type AutonomousAlertSeverity = "warning" | "critical";

export type AutonomousTicket = {
  id: string;
  projectSlug: string;
  title: string;
  status: AutonomousTicketStatus;
  priority: AutonomousPriority;
  owner: string;
  source: "orchestrator" | "worker" | "human" | "github" | "vercel" | "smoke";
  createdAt: string;
  updatedAt: string;
  summary: string;
  nextAction: string;
};

export type AutonomousWorkerRun = {
  id: string;
  projectSlug: string;
  worker: string;
  status: AutonomousWorkerStatus;
  ticketId: string;
  lastHeartbeat: string;
  summary: string;
};

export type AutonomousUrgentAlert = {
  id: string;
  projectSlug: string;
  severity: AutonomousAlertSeverity;
  title: string;
  body: string;
  createdAt: string;
  notifiedTelegram: boolean;
};

export type AutonomousState = {
  updatedAt: string;
  mode: string;
  notificationPolicy: string;
  tickets: AutonomousTicket[];
  workerRuns: AutonomousWorkerRun[];
  urgentAlerts: AutonomousUrgentAlert[];
};

export const autonomousState = autonomousStateJson as AutonomousState;

export function getAutonomousTickets(projectSlug?: string) {
  return projectSlug
    ? autonomousState.tickets.filter((ticket) => ticket.projectSlug === projectSlug)
    : autonomousState.tickets;
}

export function getAutonomousWorkerRuns(projectSlug?: string) {
  return projectSlug
    ? autonomousState.workerRuns.filter((run) => run.projectSlug === projectSlug)
    : autonomousState.workerRuns;
}

export function getUrgentAlerts(projectSlug?: string) {
  return projectSlug
    ? autonomousState.urgentAlerts.filter((alert) => alert.projectSlug === projectSlug)
    : autonomousState.urgentAlerts;
}

export function getAutonomousStats() {
  const openTickets = autonomousState.tickets.filter((ticket) => ticket.status !== "completed");
  return {
    openTickets: openTickets.length,
    runningWorkers: autonomousState.workerRuns.filter((run) => run.status === "running").length,
    urgentAlerts: autonomousState.urgentAlerts.length,
    p0Tickets: openTickets.filter((ticket) => ticket.priority === "P0").length,
  };
}
