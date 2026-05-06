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


export type ArchitectureNode = {
  id: string;
  projectSlug: string;
  name: string;
  role: "human" | "controller" | "orchestrator" | "worker" | "system" | "integration";
  status: "active" | "waiting" | "planned" | "external";
  responsibility: string;
};

export type ArchitectureRelationship = {
  id: string;
  projectSlug: string;
  from: string;
  to: string;
  label: string;
};

export type ProjectArchitecture = {
  projectSlug: string;
  summary: string;
  nodes: ArchitectureNode[];
  relationships: ArchitectureRelationship[];
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



export const architectures: ProjectArchitecture[] = [
  {
    projectSlug: "gorucu",
    summary: "Main Hermes coordinates a Görücü orchestrator, audit workers, refresh jobs, Vercel, GitHub, Supabase, and the founder feedback loop.",
    nodes: [
      { id: "can", projectSlug: "gorucu", name: "Can / Product Owner", role: "human", status: "active", responsibility: "Sets product direction, reviews live changes, handles GSC/domain-owner actions." },
      { id: "main-hermes", projectSlug: "gorucu", name: "Main Hermes Controller", role: "controller", status: "active", responsibility: "Acts as command center, validates changes, commits, pushes, deploys, and reports back." },
      { id: "orchestrator", projectSlug: "gorucu", name: "Görücü Orchestrator", role: "orchestrator", status: "waiting", responsibility: "Synthesizes worker reports and proposes the next implementation batch." },
      { id: "supabase-worker", projectSlug: "gorucu", name: "Supabase Visibility Worker", role: "worker", status: "waiting", responsibility: "Audits persistence visibility, write failures, and admin/debug signals." },
      { id: "match-intro-worker", projectSlug: "gorucu", name: "Match Intro Worker", role: "worker", status: "waiting", responsibility: "Audits intro-request persistence, CTA tracking, and match feedback loops." },
      { id: "og-warning-worker", projectSlug: "gorucu", name: "OG Warning Worker", role: "worker", status: "waiting", responsibility: "Investigates OpenGraph edge-runtime build warnings and low-risk fixes." },
      { id: "gsc-seo-worker", projectSlug: "gorucu", name: "GSC/SEO Worker", role: "worker", status: "waiting", responsibility: "Checks sitemap, robots, GSC readiness, and SEO smoke automation." },
      { id: "vercel", projectSlug: "gorucu", name: "Vercel Production", role: "integration", status: "external", responsibility: "Builds and serves gorucu.co from GitHub/Vercel deploys." },
      { id: "supabase", projectSlug: "gorucu", name: "Supabase", role: "integration", status: "external", responsibility: "Stores waitlist, analytics, profile, feedback, and match-learning data." },
    ],
    relationships: [
      { id: "g-r1", projectSlug: "gorucu", from: "can", to: "main-hermes", label: "product feedback / approvals" },
      { id: "g-r2", projectSlug: "gorucu", from: "main-hermes", to: "orchestrator", label: "plans and supervises" },
      { id: "g-r3", projectSlug: "gorucu", from: "orchestrator", to: "supabase-worker", label: "delegates audit" },
      { id: "g-r4", projectSlug: "gorucu", from: "orchestrator", to: "match-intro-worker", label: "delegates audit" },
      { id: "g-r5", projectSlug: "gorucu", from: "orchestrator", to: "og-warning-worker", label: "delegates audit" },
      { id: "g-r6", projectSlug: "gorucu", from: "orchestrator", to: "gsc-seo-worker", label: "delegates audit" },
      { id: "g-r7", projectSlug: "gorucu", from: "main-hermes", to: "vercel", label: "deploys and smokes" },
      { id: "g-r8", projectSlug: "gorucu", from: "main-hermes", to: "supabase", label: "verifies persistence" },
    ],
  },
  {
    projectSlug: "sqlquest",
    summary: "SQL Quest is tracked as a growth-focused project with founder direction, Hermes planning, and upcoming outreach/analytics workers.",
    nodes: [
      { id: "can", projectSlug: "sqlquest", name: "Can / Product Owner", role: "human", status: "active", responsibility: "Owns product strategy, pricing, content direction, and growth priorities." },
      { id: "main-hermes", projectSlug: "sqlquest", name: "Main Hermes Controller", role: "controller", status: "active", responsibility: "Tracks work, creates plans, and coordinates future automation." },
      { id: "growth-orchestrator", projectSlug: "sqlquest", name: "Growth Orchestrator", role: "orchestrator", status: "planned", responsibility: "Will coordinate influencer outreach, SEO, and funnel experiments." },
      { id: "influencer-worker", projectSlug: "sqlquest", name: "Influencer Outreach Worker", role: "worker", status: "planned", responsibility: "Will build Turkish data/SQL creator lists and outreach batches." },
      { id: "analytics-worker", projectSlug: "sqlquest", name: "Analytics Worker", role: "worker", status: "planned", responsibility: "Will inspect traffic, conversion, and lesson funnel signals." },
      { id: "github", projectSlug: "sqlquest", name: "GitHub / Product Repo", role: "integration", status: "external", responsibility: "Tracks code, releases, issues, and future PR work." },
    ],
    relationships: [
      { id: "s-r1", projectSlug: "sqlquest", from: "can", to: "main-hermes", label: "strategy and priorities" },
      { id: "s-r2", projectSlug: "sqlquest", from: "main-hermes", to: "growth-orchestrator", label: "plans growth work" },
      { id: "s-r3", projectSlug: "sqlquest", from: "growth-orchestrator", to: "influencer-worker", label: "delegates outreach" },
      { id: "s-r4", projectSlug: "sqlquest", from: "growth-orchestrator", to: "analytics-worker", label: "delegates analytics" },
      { id: "s-r5", projectSlug: "sqlquest", from: "main-hermes", to: "github", label: "tracks implementation" },
    ],
  },
  {
    projectSlug: "hermes-cockpit",
    summary: "Hermes Cockpit tracks its own open-source product loop: founder, main Hermes, bootstrap orchestrator, UI/data workers, GitHub, and Vercel.",
    nodes: [
      { id: "can", projectSlug: "hermes-cockpit", name: "Can / OSS Maintainer", role: "human", status: "active", responsibility: "Defines user needs and open-source positioning for Hermes users." },
      { id: "main-hermes", projectSlug: "hermes-cockpit", name: "Main Hermes Controller", role: "controller", status: "active", responsibility: "Implements, verifies, commits, pushes, and deploys the dashboard." },
      { id: "bootstrap-orchestrator", projectSlug: "hermes-cockpit", name: "Bootstrap Orchestrator", role: "orchestrator", status: "active", responsibility: "Breaks the dashboard into data, UI, integration, and docs tracks." },
      { id: "ui-worker", projectSlug: "hermes-cockpit", name: "Dashboard UI Worker", role: "worker", status: "active", responsibility: "Builds project cards, detail views, alerts, and architecture visualization." },
      { id: "data-worker", projectSlug: "hermes-cockpit", name: "Data Model Worker", role: "worker", status: "active", responsibility: "Defines projects, tasks, agents, events, checks, and architecture records." },
      { id: "github", projectSlug: "hermes-cockpit", name: "GitHub OSS Repository", role: "integration", status: "external", responsibility: "Hosts source, issues, roadmap, contributors, and releases." },
      { id: "vercel", projectSlug: "hermes-cockpit", name: "Vercel Demo", role: "integration", status: "external", responsibility: "Serves the live open-source dashboard demo." },
    ],
    relationships: [
      { id: "h-r1", projectSlug: "hermes-cockpit", from: "can", to: "main-hermes", label: "product request" },
      { id: "h-r2", projectSlug: "hermes-cockpit", from: "main-hermes", to: "bootstrap-orchestrator", label: "coordinates build" },
      { id: "h-r3", projectSlug: "hermes-cockpit", from: "bootstrap-orchestrator", to: "ui-worker", label: "ships interface" },
      { id: "h-r4", projectSlug: "hermes-cockpit", from: "bootstrap-orchestrator", to: "data-worker", label: "ships data model" },
      { id: "h-r5", projectSlug: "hermes-cockpit", from: "main-hermes", to: "github", label: "pushes OSS changes" },
      { id: "h-r6", projectSlug: "hermes-cockpit", from: "main-hermes", to: "vercel", label: "deploys demo" },
    ],
  },
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
    architecture: architectures.find((architecture) => architecture.projectSlug === slug),
    timeline: timeline.filter((event) => event.projectSlug === slug),
  };
}
