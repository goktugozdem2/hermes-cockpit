import { describe, expect, it } from "vitest";
import { getProjectDetails, projects } from "./cockpit-data";

describe("project architecture", () => {
  it("exposes architecture nodes and relationships for every project", () => {
    for (const project of projects) {
      const details = getProjectDetails(project.slug);

      expect(details.architecture?.nodes.length).toBeGreaterThanOrEqual(3);
      expect(details.architecture?.relationships.length).toBeGreaterThanOrEqual(2);
      expect(details.architecture?.nodes.some((node) => node.role === "orchestrator")).toBe(true);
      expect(details.architecture?.nodes.some((node) => node.role === "worker")).toBe(true);
      expect(details.architecture?.nodes.some((node) => node.role === "human")).toBe(true);
    }
  });

  it("shows the exact workers involved in the Gorucu project", () => {
    const details = getProjectDetails("gorucu");
    const names = details.architecture?.nodes.map((node) => node.name) ?? [];

    expect(names).toContain("Main Hermes Controller");
    expect(names).toContain("Görücü Orchestrator");
    expect(names).toContain("Supabase Visibility Worker");
    expect(names).toContain("Match Intro Worker");
    expect(names).toContain("OG Warning Worker");
    expect(names).toContain("GSC/SEO Worker");
  });
});
