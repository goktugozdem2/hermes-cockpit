import { describe, expect, it } from "vitest";
import {
  autonomousState,
  getAutonomousStats,
  getAutonomousTickets,
  getAutonomousWorkerRuns,
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
    expect(getAutonomousTickets("hermes-cockpit").map((ticket) => ticket.projectSlug)).toEqual(["hermes-cockpit"]);
    expect(getAutonomousWorkerRuns("hermes-cockpit").length).toBeGreaterThan(0);
    expect(getAutonomousStats().openTickets).toBeGreaterThan(0);
    expect(getAutonomousStats().runningWorkers).toBeGreaterThan(0);
  });
});
