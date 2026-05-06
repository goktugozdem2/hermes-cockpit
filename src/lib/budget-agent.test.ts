import { describe, expect, it } from "vitest";
import {
  estimateTicketSpend,
  getBudgetRisk,
  getBudgetSnapshot,
  getPrioritizedTicketPlan,
} from "./budget-agent";
import { autonomousState } from "./autonomous-state";

describe("budget agent", () => {
  it("estimates ticket cost and budget impact from planned tokens", () => {
    const estimate = estimateTicketSpend({
      id: "T1",
      title: "Large implementation",
      estimatedInputTokens: 1_000_000,
      estimatedOutputTokens: 250_000,
      model: "gpt-5.5",
      inputCostPerMillion: 1.25,
      outputCostPerMillion: 10,
      monthlyBudgetUsd: 100,
      remainingBudgetUsd: 50,
    });

    expect(estimate.estimatedCostUsd).toBeCloseTo(3.75, 2);
    expect(estimate.remainingBudgetImpactPercent).toBeCloseTo(7.5, 1);
    expect(estimate.recommendation).toBe("auto");
  });

  it("flags expensive tickets for approval or deferral", () => {
    expect(getBudgetRisk(4)).toBe("low");
    expect(getBudgetRisk(18)).toBe("medium");
    expect(getBudgetRisk(35)).toBe("high");
    expect(getBudgetRisk(110)).toBe("blocked");
  });

  it("builds a prioritized plan within the remaining budget", () => {
    const snapshot = getBudgetSnapshot(autonomousState);
    const plan = getPrioritizedTicketPlan(autonomousState);

    expect(snapshot.monthlyBudgetUsd).toBeGreaterThan(0);
    expect(snapshot.remainingBudgetUsd).toBeGreaterThan(0);
    expect(plan.length).toBeGreaterThan(0);
    expect(plan[0].priority).toBe("P0");
    expect(plan.every((ticket) => ticket.estimatedTokens.total > 0)).toBe(true);
  });
});
