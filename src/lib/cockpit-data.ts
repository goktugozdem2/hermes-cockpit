export type ProjectStatus = "healthy" | "warning" | "blocked" | "running";
export type TaskStatus = "pending" | "in_progress" | "blocked" | "completed";
export type Severity = "info" | "warning" | "critical" | "success";

export type Project = {
  id: string;
  name: string;
  slug: string;
  description: string;
  repo: string;
  productionUrl: string;
  status: ProjectStatus;
  focus: string;
  updatedAt: string;
  activeAgents: number;
  pendingTasks: number;
  blockedTasks: number;
  failingChecks: number;
  lastDeploy: string;
  healthScore: number;
  tags: string[];
};

export type CockpitTask = {
  id: string;
  projectSlug: string;
  title: string;
  status: TaskStatus;
  priority: "P0" | "P1" | "P2";
  owner: string;
};

export type CockpitAlert = {
  id: string;
  projectSlug: string;
  severity: Severity;
  title: string;
  body: string;
  source: "Hermes" | "GitHub" | "Vercel" | "Supabase" | "GSC" | "Manual";
  createdAt: string;
};

export type AgentRun = {
  id: string;
  projectSlug: string;
  name: string;
  status: "running" | "completed" | "waiting" | "failed";
  currentTask: string;
  lastHeartbeat: string;
};

export type TimelineEvent = {
  id: string;
  projectSlug: string;
  type: "agent" | "deploy" | "check" | "task" | "research";
  title: string;
  body: string;
  createdAt: string;
  severity: Severity;
};

export const projects: Project[] = [
  {
    id: "gorucu",
    name: "Görücü",
    slug: "gorucu",
    description: "Photo-free AI marriage matching MVP with growth, SEO, and agent automation work in progress.",
    repo: "goktugozdem2/gorucu",
    productionUrl: "https://gorucu.co",
    status: "running",
    focus: "Growth funnel, GSC readiness, and agent-orchestrated product iteration.",
    updatedAt: "2026-05-06T07:10:00Z",
    activeAgents: 1,
    pendingTasks: 4,
    blockedTasks: 0,
    failingChecks: 0,
    lastDeploy: "6a079ee",
    healthScore: 91,
    tags: ["Next.js", "Vercel", "Supabase", "Hermes"],
  },
  {
    id: "sqlquest",
    name: "SQL Quest",
    slug: "sqlquest",
    description: "Browser-based SQL practice platform with AI Coach and interview prep growth channels.",
    repo: "sqlquest/app",
    productionUrl: "https://sqlquest.app",
    status: "warning",
    focus: "Influencer growth and Turkish traffic expansion.",
    updatedAt: "2026-05-05T19:30:00Z",
    activeAgents: 0,
    pendingTasks: 6,
    blockedTasks: 1,
    failingChecks: 0,
    lastDeploy: "monitoring pending",
    healthScore: 78,
    tags: ["SQL", "AI Coach", "Growth", "Analytics"],
  },
  {
    id: "hermes-cockpit",
    name: "Hermes Cockpit",
    slug: "hermes-cockpit",
    description: "Open-source multi-project mission control for Hermes Agent users.",
    repo: "goktugozdem2/hermes-cockpit",
    productionUrl: "local MVP",
    status: "running",
    focus: "Initial open-source MVP, project cards, alerts, and agent timeline.",
    updatedAt: "2026-05-06T07:15:00Z",
    activeAgents: 1,
    pendingTasks: 5,
    blockedTasks: 0,
    failingChecks: 0,
    lastDeploy: "bootstrap",
    healthScore: 84,
    tags: ["Open Source", "Hermes", "Dashboard", "Next.js"],
  },
];

export const tasks: CockpitTask[] = [
  { id: "g-1", projectSlug: "gorucu", title: "Synthesize autonomous worker reports", status: "pending", priority: "P1", owner: "orchestrator" },
  { id: "g-2", projectSlug: "gorucu", title: "Add match intro request persistence", status: "pending", priority: "P1", owner: "Hermes" },
  { id: "g-3", projectSlug: "gorucu", title: "Confirm GSC sitemap submission", status: "pending", priority: "P1", owner: "Can" },
  { id: "s-1", projectSlug: "sqlquest", title: "Prepare Turkish influencer outreach batch", status: "blocked", priority: "P1", owner: "growth" },
  { id: "h-1", projectSlug: "hermes-cockpit", title: "Publish first public GitHub repository", status: "in_progress", priority: "P0", owner: "Hermes" },
  { id: "h-2", projectSlug: "hermes-cockpit", title: "Define Hermes event ingestion protocol", status: "pending", priority: "P1", owner: "community" },
];

export const alerts: CockpitAlert[] = [
  {
    id: "a-1",
    projectSlug: "gorucu",
    severity: "warning",
    title: "FortiGuard category still warming up",
    body: "Some corporate networks may classify the new domain as Newly Observed Domain until reputation improves.",
    source: "Manual",
    createdAt: "2026-05-06T06:38:00Z",
  },
  {
    id: "a-2",
    projectSlug: "gorucu",
    severity: "success",
    title: "Live smoke passed",
    body: "Custom domain smoke checks passed across core routes, sitemap, robots, and agent board.",
    source: "Hermes",
    createdAt: "2026-05-06T06:55:00Z",
  },
  {
    id: "a-3",
    projectSlug: "sqlquest",
    severity: "warning",
    title: "Growth follow-up pending",
    body: "Influencer/contact pipeline needs a fresh prioritized outreach batch.",
    source: "Manual",
    createdAt: "2026-05-05T19:30:00Z",
  },
  {
    id: "a-4",
    projectSlug: "hermes-cockpit",
    severity: "info",
    title: "Open-source MVP started",
    body: "Initial cockpit data model and dashboard are being scaffolded for Hermes Agent users.",
    source: "Hermes",
    createdAt: "2026-05-06T07:15:00Z",
  },
];

export const agentRuns: AgentRun[] = [
  { id: "r-1", projectSlug: "gorucu", name: "gorucu-orchestrator-synthesis", status: "waiting", currentTask: "Summarize worker reports", lastHeartbeat: "2026-05-06T06:45:00Z" },
  { id: "r-2", projectSlug: "gorucu", name: "gorucu-agent-board-refresh", status: "running", currentTask: "Refresh local board artifacts", lastHeartbeat: "2026-05-06T07:08:00Z" },
  { id: "r-3", projectSlug: "hermes-cockpit", name: "bootstrap-agent", status: "running", currentTask: "Create open-source dashboard MVP", lastHeartbeat: "2026-05-06T07:15:00Z" },
];

export const timeline: TimelineEvent[] = [
  { id: "t-1", projectSlug: "gorucu", type: "deploy", title: "Agent board deployed", body: "Commit 6a079ee shipped /agent-board and passed live smoke.", createdAt: "2026-05-06T06:56:00Z", severity: "success" },
  { id: "t-2", projectSlug: "gorucu", type: "check", title: "SEO safety verified", body: "Agent board is noindex, robots-disallowed, and excluded from sitemap.", createdAt: "2026-05-06T06:57:00Z", severity: "success" },
  { id: "t-3", projectSlug: "hermes-cockpit", type: "research", title: "GitHub landscape reviewed", body: "cloglog, claude-cockpit, fleetlens, and agent-orchestrator studied; build-own path selected.", createdAt: "2026-05-06T07:05:00Z", severity: "info" },
  { id: "t-4", projectSlug: "hermes-cockpit", type: "agent", title: "MVP scaffold started", body: "Next.js app, seed projects, alerts, tasks, and agent timeline are being prepared.", createdAt: "2026-05-06T07:15:00Z", severity: "info" },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getProjectStats() {
  return {
    totalProjects: projects.length,
    warningProjects: projects.filter((project) => project.status === "warning" || project.status === "blocked").length,
    activeAgents: projects.reduce((sum, project) => sum + project.activeAgents, 0),
    pendingTasks: tasks.filter((task) => task.status === "pending" || task.status === "in_progress").length,
    criticalAlerts: alerts.filter((alert) => alert.severity === "critical" || alert.severity === "warning").length,
  };
}

export function getProjectDetails(slug: string) {
  return {
    project: getProjectBySlug(slug),
    tasks: tasks.filter((task) => task.projectSlug === slug),
    alerts: alerts.filter((alert) => alert.projectSlug === slug),
    agentRuns: agentRuns.filter((run) => run.projectSlug === slug),
    timeline: timeline.filter((event) => event.projectSlug === slug),
  };
}
