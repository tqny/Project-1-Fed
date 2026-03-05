import type { OpportunityBrief, ScoreBreakdown } from "@/packages/core/types";

export type LeadRationale = {
  reasons: string[];
  componentScores: {
    scaleAndBudget: number;
    spendPropensity: number;
    organizationalReadiness: number;
    urgencyPressure: number;
  };
  thresholds?: unknown;
  disclosure?: string;
};

export function parseNaics(input: string): string[] {
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      return parsed.filter((value): value is string => typeof value === "string");
    }
  } catch {
    // no-op
  }

  return [];
}

export function parseScoreBreakdown(input: string): ScoreBreakdown {
  try {
    const parsed = JSON.parse(input) as ScoreBreakdown;
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.reasons)) {
      return parsed;
    }
  } catch {
    // no-op
  }

  return {
    fit: 0,
    timing: 0,
    signal: 0,
    complexity: 0,
    weightedTotal: 0,
    reasons: ["Scoring unavailable"],
    details: {
      fit: [],
      timing: [],
      signal: [],
      complexity: []
    }
  };
}

export function parseBrief(input: string | null): OpportunityBrief | null {
  if (!input) {
    return null;
  }

  try {
    const parsed = JSON.parse(input) as OpportunityBrief;
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.discoveryQuestions)) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export function parseLeadRationale(input: string): LeadRationale | null {
  try {
    const parsed = JSON.parse(input) as LeadRationale;
    if (parsed && Array.isArray(parsed.reasons) && parsed.componentScores) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export function parseStringMap(input: string): Record<string, string> | null {
  try {
    const parsed = JSON.parse(input) as Record<string, string>;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}
