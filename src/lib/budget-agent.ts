import type { AutonomousState, AutonomousTicket } from "./autonomous-state";

export type BudgetRisk = "low" | "medium" | "high" | "blocked";
export type BudgetRecommendation = "auto" | "review" | "defer" | "blocked";

export type TicketSpendInput = {
  id: string;
  title: string;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  model: string;
  inputCostPerMillion: number;
  outputCostPerMillion: number;
  monthlyBudgetUsd: number;
  remainingBudgetUsd: number;
};

export type TicketSpendEstimate = {
  ticketId: string;
  model: string;
  estimatedTokens: {
    input: number;
    output: number;
    total: number;
  };
  estimatedCostUsd: number;
  monthlyBudgetImpactPercent: number;
  remainingBudgetImpactPercent: number;
  risk: BudgetRisk;
  recommendation: BudgetRecommendation;
};

export type BudgetSnapshot = {
  monthlyBudgetUsd: number;
  usedUsd: number;
  remainingBudgetUsd: number;
  usedPercent: number;
  remainingPercent: number;
  monthlyTokenLimit: number;
  usedTokens: number;
  remainingTokens: number;
  tokenUsedPercent: number;
  resetAt: string;
  source: string;
};

export type PlannedTicket = AutonomousTicket & TicketSpendEstimate;

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number) {
  return Math.round(value * 10) / 10;
}

export function getBudgetRisk(remainingBudgetImpactPercent: number): BudgetRisk {
  if (remainingBudgetImpactPercent >= 100) return "blocked";
  if (remainingBudgetImpactPercent >= 30) return "high";
  if (remainingBudgetImpactPercent >= 10) return "medium";
  return "low";
}

function recommendationForRisk(risk: BudgetRisk): BudgetRecommendation {
  if (risk === "blocked") return "blocked";
  if (risk === "high") return "defer";
  if (risk === "medium") return "review";
  return "auto";
}

export function estimateTicketSpend(input: TicketSpendInput): TicketSpendEstimate {
  const estimatedCostUsd =
    (input.estimatedInputTokens / 1_000_000) * input.inputCostPerMillion +
    (input.estimatedOutputTokens / 1_000_000) * input.outputCostPerMillion;
  const monthlyBudgetImpactPercent = input.monthlyBudgetUsd > 0 ? (estimatedCostUsd / input.monthlyBudgetUsd) * 100 : 0;
  const remainingBudgetImpactPercent = input.remainingBudgetUsd > 0 ? (estimatedCostUsd / input.remainingBudgetUsd) * 100 : 100;
  const risk = getBudgetRisk(remainingBudgetImpactPercent);

  return {
    ticketId: input.id,
    model: input.model,
    estimatedTokens: {
      input: input.estimatedInputTokens,
      output: input.estimatedOutputTokens,
      total: input.estimatedInputTokens + input.estimatedOutputTokens,
    },
    estimatedCostUsd: roundMoney(estimatedCostUsd),
    monthlyBudgetImpactPercent: roundPercent(monthlyBudgetImpactPercent),
    remainingBudgetImpactPercent: roundPercent(remainingBudgetImpactPercent),
    risk,
    recommendation: recommendationForRisk(risk),
  };
}

export function getBudgetSnapshot(state: AutonomousState): BudgetSnapshot {
  const budget = state.aiBudget;
  const monthlyBudgetUsd = budget?.monthlyBudgetUsd ?? 100;
  const usedUsd = budget?.usedUsd ?? 0;
  const remainingBudgetUsd = Math.max(monthlyBudgetUsd - usedUsd, 0);
  const monthlyTokenLimit = budget?.monthlyTokenLimit ?? 300_000_000;
  const usedTokens = budget?.usedTokens ?? 0;
  const remainingTokens = Math.max(monthlyTokenLimit - usedTokens, 0);

  return {
    monthlyBudgetUsd,
    usedUsd: roundMoney(usedUsd),
    remainingBudgetUsd: roundMoney(remainingBudgetUsd),
    usedPercent: monthlyBudgetUsd > 0 ? roundPercent((usedUsd / monthlyBudgetUsd) * 100) : 0,
    remainingPercent: monthlyBudgetUsd > 0 ? roundPercent((remainingBudgetUsd / monthlyBudgetUsd) * 100) : 0,
    monthlyTokenLimit,
    usedTokens,
    remainingTokens,
    tokenUsedPercent: monthlyTokenLimit > 0 ? roundPercent((usedTokens / monthlyTokenLimit) * 100) : 0,
    resetAt: budget?.resetAt ?? "unknown",
    source: budget?.source ?? "manual-estimate",
  };
}

export function getPrioritizedTicketPlan(state: AutonomousState): PlannedTicket[] {
  const snapshot = getBudgetSnapshot(state);
  const budget = state.aiBudget;
  const defaultModel = budget?.defaultModel ?? "gpt-5.5";
  const defaultInputCost = budget?.inputCostPerMillion ?? 1.25;
  const defaultOutputCost = budget?.outputCostPerMillion ?? 10;
  const priorityRank = { P0: 0, P1: 1, P2: 2, P3: 3 } as const;

  return [...state.tickets]
    .filter((ticket) => ticket.status !== "completed")
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
    .map((ticket) => {
      const estimate = ticket.spendEstimate;
      const spend = estimateTicketSpend({
        id: ticket.id,
        title: ticket.title,
        estimatedInputTokens: estimate?.estimatedInputTokens ?? 120_000,
        estimatedOutputTokens: estimate?.estimatedOutputTokens ?? 25_000,
        model: estimate?.model ?? defaultModel,
        inputCostPerMillion: estimate?.inputCostPerMillion ?? defaultInputCost,
        outputCostPerMillion: estimate?.outputCostPerMillion ?? defaultOutputCost,
        monthlyBudgetUsd: snapshot.monthlyBudgetUsd,
        remainingBudgetUsd: snapshot.remainingBudgetUsd,
      });

      return { ...ticket, ...spend };
    });
}
