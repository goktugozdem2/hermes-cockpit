import { describe, expect, it } from "vitest";
import {
  autonomousState,
  getAutonomousStats,
  getAutonomousTickets,
  getAutonomousWorkerRuns,
  getHourlyActivity,
} from "./autonomous-state";
import { projects } from "./cockpit-data";

describe("autonomous state", () => {
  it("tracks open tickets with valid project slugs", () => {
    const projectSlugs = new Set(projects.map((project) => project.slug));

    expect(autonomousState.tickets.length).toBeGreaterThan(0);
    for (const ticket of autonomousState.tickets) {
      expect(projectSlugs.has(ticket.projectSlug)).toBe(true);
      expect(ticket.title.length).toBeGreaterThan(5);
      expect(ticket.nextAction.length).toBeGreaterThan(5);
    }
  });

  it("connects worker runs to existing tickets", () => {
    const ticketIds = new Set(autonomousState.tickets.map((ticket) => ticket.id));

    expect(autonomousState.workerRuns.length).toBeGreaterThan(0);
    for (const run of autonomousState.workerRuns) {
      expect(ticketIds.has(run.ticketId)).toBe(true);
    }
  });

  it("returns filtered project views and global stats", () => {
    const cockpitTickets = getAutonomousTickets("hermes-cockpit");

    expect(cockpitTickets.length).toBeGreaterThan(0);
    expect(cockpitTickets.every((ticket) => ticket.projectSlug === "hermes-cockpit")).toBe(true);
    expect(getAutonomousWorkerRuns("hermes-cockpit").length).toBeGreaterThan(0);
    expect(getAutonomousStats().openTickets).toBeGreaterThan(0);
    expect(getAutonomousStats().runningWorkers).toBeGreaterThan(0);
  });

  it("keeps hourly activity totals consistent for dashboard charts", () => {
    const projectSlugs = new Set(projects.map((project) => project.slug));
    const hours = getHourlyActivity();

    expect(hours.length).toBeGreaterThan(0);
    for (const hour of hours) {
      expect(hour.projects.every((project) => projectSlugs.has(project.projectSlug))).toBe(true);
      expect(hour.totalWorkUnits).toBe(hour.projects.reduce((sum, project) => sum + project.workUnits, 0));
      expect(hour.totalTokens).toBe(hour.projects.reduce((sum, project) => sum + project.inputTokens + project.outputTokens, 0));
    }

    expect(getHourlyActivity("hermes-cockpit").every((hour) => hour.projects.every((project) => project.projectSlug === "hermes-cockpit"))).toBe(true);
  });
});
