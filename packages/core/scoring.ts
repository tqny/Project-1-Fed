import type { ProductProfile } from "@/config/productProfile";
import type { NormalizedOpportunity, ScoreBreakdown } from "@/packages/core/types";

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function keywordHits(text: string, keywords: string[]): string[] {
  const lowered = text.toLowerCase();
  return keywords.filter((keyword) => lowered.includes(keyword.toLowerCase()));
}

function normalizeWeightTotal(profile: ProductProfile): number {
  const total =
    profile.weights.fit +
    profile.weights.timing +
    profile.weights.signal +
    profile.weights.complexity;

  return total === 0 ? 1 : total;
}

export function scoreOpportunity(
  opp: NormalizedOpportunity,
  profile: ProductProfile
): { total: number; breakdown: ScoreBreakdown } {
  const now = new Date();
  const text = `${opp.title}\n${opp.description ?? ""}`;

  const fitReasons: string[] = [];
  const timingReasons: string[] = [];
  const signalReasons: string[] = [];
  const complexityReasons: string[] = [];

  const naicsOverlap = opp.naics.filter((code) => profile.target_naics.includes(code));
  const naicsScore =
    profile.target_naics.length === 0
      ? 20
      : clamp((naicsOverlap.length / profile.target_naics.length) * 55, 0, 55);

  if (naicsOverlap.length > 0) {
    fitReasons.push(`NAICS overlap: ${naicsOverlap.join(", ")}`);
  } else {
    fitReasons.push("No direct NAICS overlap with target profile");
  }

  const positiveHits = keywordHits(text, profile.keywords_positive);
  const negativeHits = keywordHits(text, profile.keywords_negative);

  const positiveScore = clamp(positiveHits.length * 8, 0, 32);
  const negativePenalty = clamp(negativeHits.length * 10, 0, 30);

  if (positiveHits.length > 0) {
    fitReasons.push(`Positive keyword hits: ${positiveHits.slice(0, 5).join(", ")}`);
  }
  if (negativeHits.length > 0) {
    fitReasons.push(`Negative keyword penalties: ${negativeHits.slice(0, 5).join(", ")}`);
  }

  const agencyMatch = profile.target_agencies.some((agency) =>
    opp.agency.toLowerCase().includes(agency.toLowerCase())
  );
  const agencyBoost = agencyMatch ? 13 : 0;
  if (agencyMatch) {
    fitReasons.push("Agency matched target agency list");
  }

  const fit = clamp(naicsScore + positiveScore + agencyBoost - negativePenalty);

  const dueDate = opp.dueDate ?? null;
  let dueScore = 45;
  if (dueDate) {
    const daysUntilDue = daysBetween(dueDate, now);
    if (daysUntilDue < 0) {
      dueScore = 0;
      timingReasons.push("Opportunity appears overdue");
    } else if (daysUntilDue <= 7) {
      dueScore = 92;
      timingReasons.push("Due date is within 7 days");
    } else if (daysUntilDue <= 14) {
      dueScore = 78;
      timingReasons.push("Due date is within 14 days");
    } else if (daysUntilDue <= 30) {
      dueScore = 64;
      timingReasons.push("Due date is within 30 days");
    } else {
      dueScore = 50;
      timingReasons.push("Due date is beyond 30 days");
    }
  } else {
    timingReasons.push("No due date available");
  }

  const daysSincePosted = daysBetween(now, opp.postedDate);
  let recencyScore = 35;
  if (daysSincePosted <= 3) {
    recencyScore = 92;
    timingReasons.push("Recently posted (<= 3 days)");
  } else if (daysSincePosted <= 7) {
    recencyScore = 78;
    timingReasons.push("Posted within last week");
  } else if (daysSincePosted <= 14) {
    recencyScore = 65;
    timingReasons.push("Posted within last 14 days");
  } else {
    timingReasons.push("Older posting");
  }

  const timing = clamp(dueScore * 0.65 + recencyScore * 0.35);

  let signal = 45;
  const spendRaw = opp.enrichment?.spend3y;
  const spend3y =
    typeof spendRaw === "number" ? spendRaw : typeof spendRaw === "string" ? Number(spendRaw) : NaN;

  if (Number.isFinite(spend3y) && spend3y > 0) {
    signal = clamp(20 + Math.log10(spend3y + 1) * 18);
    signalReasons.push(`Agency 3Y spend context available: $${Math.round(spend3y).toLocaleString()}`);
  } else {
    signalReasons.push("No reliable agency spend context available");
  }

  const descriptionLength = (opp.description ?? "").trim().length;
  let complexity = 70;
  if (descriptionLength > 12000) {
    complexity = 35;
    complexityReasons.push("Very long description may increase delivery complexity");
  } else if (descriptionLength > 7000) {
    complexity = 50;
    complexityReasons.push("Long description likely increases complexity");
  } else if (descriptionLength > 0) {
    complexity = 75;
    complexityReasons.push("Description length appears manageable");
  } else {
    complexity = 55;
    complexityReasons.push("No description available; scope ambiguity risk");
  }

  const ambiguousTerms = keywordHits(text, ["tbd", "to be determined", "as needed", "option year"]);
  if (ambiguousTerms.length > 0) {
    complexity = clamp(complexity - Math.min(18, ambiguousTerms.length * 5));
    complexityReasons.push(`Ambiguity terms detected: ${ambiguousTerms.join(", ")}`);
  }

  const totalWeight = normalizeWeightTotal(profile);

  const weightedTotal = clamp(
    ((fit * profile.weights.fit +
      timing * profile.weights.timing +
      signal * profile.weights.signal +
      complexity * profile.weights.complexity) /
      totalWeight),
    0,
    100
  );

  const reasons = [
    ...fitReasons.slice(0, 2),
    ...timingReasons.slice(0, 1),
    ...signalReasons.slice(0, 1),
    ...complexityReasons.slice(0, 1)
  ];

  return {
    total: Number(weightedTotal.toFixed(2)),
    breakdown: {
      fit: Number(fit.toFixed(2)),
      timing: Number(timing.toFixed(2)),
      signal: Number(signal.toFixed(2)),
      complexity: Number(complexity.toFixed(2)),
      weightedTotal: Number(weightedTotal.toFixed(2)),
      reasons,
      details: {
        fit: fitReasons,
        timing: timingReasons,
        signal: signalReasons,
        complexity: complexityReasons
      }
    }
  };
}
