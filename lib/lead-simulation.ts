import { enterpriseICPProfile, resolveGradeBand } from "@/config/icpProfile";
import { publicOrgSeeds } from "@/lib/publicOrgSeeds";

type GradeLabel = "A" | "B" | "C" | "D" | "F";

type GradeMix = Record<Exclude<GradeLabel, "F">, number>;

export type LeadDraft = {
  orgName: string;
  agencyName: string;
  segment: string;
  website: string;
  phone: string;
  headcount: number;
  annualBudgetM: number;
  relatedSpendM: number;
  governanceRoleTitle: string | null;
  governanceRolePresent: boolean;
  procurementReadiness: number;
  complianceUrgency: number;
  regulatoryComplexity: number;
  cyberPressure: number;
  icpScore: number;
  icpGrade: GradeLabel;
  fitBand: string;
  considerable: boolean;
  status: string;
  priorityRank: number | null;
  rationale: string;
  fieldProvenance: string;
};

export type GenerateLeadsResult = {
  leads: LeadDraft[];
  summary: {
    total: number;
    gradeCounts: Record<GradeLabel, number>;
    fitBandCounts: Record<string, number>;
    considerableCount: number;
    targetMix: GradeMix;
    disclosure: string;
  };
};

export type SortResult = {
  updates: Array<{ id: string; priorityRank: number | null; status: string }>;
  summary: {
    sortedCount: number;
    queuedCount: number;
    discardedCount: number;
    topHandoff: Array<{ orgName: string; icpGrade: string; icpScore: number; priorityRank: number }>;
  };
};

const defaultMix: GradeMix = {
  A: 0.38,
  B: 0.3,
  C: 0.22,
  D: 0.1
};

const officeVariants = [
  "CIO Office",
  "Chief Data Office",
  "Acquisition Directorate",
  "Digital Services Division",
  "Program Executive Office",
  "Enterprise IT Directorate",
  "Risk & Compliance Office",
  "Cyber Operations Office"
];

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomFloat(min, max + 1));
}

function pickOne<T>(list: T[]): T {
  return list[randomInt(0, list.length - 1)];
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function round2(value: number): number {
  return Number(value.toFixed(2));
}

function normalizeMix(input?: Partial<GradeMix>): GradeMix {
  const merged: GradeMix = {
    A: input?.A ?? defaultMix.A,
    B: input?.B ?? defaultMix.B,
    C: input?.C ?? defaultMix.C,
    D: input?.D ?? defaultMix.D
  };

  const total = merged.A + merged.B + merged.C + merged.D;
  if (total <= 0) {
    return defaultMix;
  }

  return {
    A: merged.A / total,
    B: merged.B / total,
    C: merged.C / total,
    D: merged.D / total
  };
}

function buildTargets(count: number, mix: GradeMix): Array<Exclude<GradeLabel, "F">> {
  const labels: Array<Exclude<GradeLabel, "F">> = ["A", "B", "C", "D"];

  const targets = labels.flatMap((label) => {
    const bucketCount = Math.round(count * mix[label]);
    return Array.from({ length: bucketCount }, () => label);
  });

  while (targets.length < count) {
    targets.push(pickOne(labels));
  }

  while (targets.length > count) {
    targets.pop();
  }

  for (let index = targets.length - 1; index > 0; index -= 1) {
    const swap = randomInt(0, index);
    [targets[index], targets[swap]] = [targets[swap], targets[index]];
  }

  return targets;
}

function roleConfig(target: Exclude<GradeLabel, "F">): { present: boolean; title: string | null } {
  if (target === "A") {
    return {
      present: true,
      title: pickOne([
        "Director of Responsible AI",
        "Chief Data Governance Officer",
        "AI Risk & Compliance Program Manager",
        "Deputy CISO for AI Security"
      ])
    };
  }

  if (target === "B") {
    return {
      present: Math.random() < 0.85,
      title: pickOne([
        "AI Governance Lead",
        "Data Policy Program Manager",
        "Compliance Engineering Manager",
        "Digital Trust Program Lead"
      ])
    };
  }

  if (target === "C") {
    const present = Math.random() < 0.55;
    return {
      present,
      title: present
        ? pickOne([
            "Interim AI Governance Coordinator",
            "Enterprise Risk Advisor",
            "Governance Analyst"
          ])
        : null
    };
  }

  const present = Math.random() < 0.25;
  return {
    present,
    title: present ? pickOne(["IT Compliance Specialist", "Cyber Program Analyst"]) : null
  };
}

function syntheticRanges(target: Exclude<GradeLabel, "F">): {
  budgetMultiplier: [number, number];
  spendRatio: [number, number];
  procurementReadiness: [number, number];
  complianceUrgency: [number, number];
  regulatoryComplexity: [number, number];
  cyberPressure: [number, number];
} {
  if (target === "A") {
    return {
      budgetMultiplier: [1.2, 1.8],
      spendRatio: [0.05, 0.12],
      procurementReadiness: [72, 95],
      complianceUrgency: [70, 95],
      regulatoryComplexity: [70, 96],
      cyberPressure: [65, 92]
    };
  }

  if (target === "B") {
    return {
      budgetMultiplier: [0.85, 1.3],
      spendRatio: [0.03, 0.08],
      procurementReadiness: [60, 84],
      complianceUrgency: [58, 84],
      regulatoryComplexity: [58, 86],
      cyberPressure: [52, 80]
    };
  }

  if (target === "C") {
    return {
      budgetMultiplier: [0.6, 1.0],
      spendRatio: [0.015, 0.05],
      procurementReadiness: [42, 68],
      complianceUrgency: [42, 70],
      regulatoryComplexity: [40, 70],
      cyberPressure: [35, 66]
    };
  }

  return {
    budgetMultiplier: [0.3, 0.75],
    spendRatio: [0.008, 0.035],
    procurementReadiness: [30, 60],
    complianceUrgency: [30, 62],
    regulatoryComplexity: [30, 60],
    cyberPressure: [25, 56]
  };
}

function scoreLead(signals: {
  headcount: number;
  annualBudgetM: number;
  relatedSpendM: number;
  governanceRolePresent: boolean;
  procurementReadiness: number;
  complianceUrgency: number;
  regulatoryComplexity: number;
  cyberPressure: number;
}): {
  total: number;
  grade: GradeLabel;
  fitBand: string;
  considerable: boolean;
  reasons: string[];
  componentScores: {
    scaleAndBudget: number;
    spendPropensity: number;
    organizationalReadiness: number;
    urgencyPressure: number;
  };
} {
  const { ideal, acceptable } = enterpriseICPProfile.enterpriseCriteria;

  const headcountScore = clamp((signals.headcount / ideal.minHeadcount) * 100);
  const budgetScore = clamp((signals.annualBudgetM / ideal.minAnnualBudgetM) * 100);
  const scaleAndBudget = clamp(headcountScore * 0.55 + budgetScore * 0.45);

  const spendVsIdeal = clamp((signals.relatedSpendM / ideal.minRelatedSpendM) * 100);
  const spendVsAcceptable = clamp((signals.relatedSpendM / acceptable.minRelatedSpendM) * 100);
  const spendPropensity = clamp(spendVsIdeal * 0.65 + spendVsAcceptable * 0.35);

  const roleScore = signals.governanceRolePresent ? 90 : 30;
  const organizationalReadiness = clamp(roleScore * 0.35 + signals.procurementReadiness * 0.65);

  const urgencyPressure = clamp(
    signals.complianceUrgency * 0.4 + signals.regulatoryComplexity * 0.35 + signals.cyberPressure * 0.25
  );

  const total = clamp(
    scaleAndBudget * enterpriseICPProfile.gradingWeights.scaleAndBudget +
      spendPropensity * enterpriseICPProfile.gradingWeights.spendPropensity +
      organizationalReadiness * enterpriseICPProfile.gradingWeights.organizationalReadiness +
      urgencyPressure * enterpriseICPProfile.gradingWeights.urgencyPressure
  );

  const band = resolveGradeBand(total);

  const reasons: string[] = [];
  reasons.push(
    `Scale score ${Math.round(scaleAndBudget)} from headcount ${signals.headcount.toLocaleString()} and annual budget $${Math.round(signals.annualBudgetM).toLocaleString()}M.`
  );
  reasons.push(
    `Spend propensity ${Math.round(spendPropensity)} from simulated related spend $${Math.round(signals.relatedSpendM).toLocaleString()}M.`
  );
  reasons.push(
    signals.governanceRolePresent
      ? "Governance role signal present, indicating organizational readiness for AI compliance adoption."
      : "No dedicated governance role signal; readiness risk remains elevated."
  );
  reasons.push(
    `Urgency composite ${Math.round(urgencyPressure)} from compliance pressure, regulatory complexity, and cyber pressure indicators.`
  );

  return {
    total: round2(total),
    grade: band.label,
    fitBand: band.fitBand,
    considerable: band.considerable,
    reasons,
    componentScores: {
      scaleAndBudget: round2(scaleAndBudget),
      spendPropensity: round2(spendPropensity),
      organizationalReadiness: round2(organizationalReadiness),
      urgencyPressure: round2(urgencyPressure)
    }
  };
}

function generateOne(target: Exclude<GradeLabel, "F">): LeadDraft {
  const seed = pickOne(publicOrgSeeds);
  const ranges = syntheticRanges(target);

  const role = roleConfig(target);

  const annualBudgetM =
    seed.headcount * randomFloat(0.03, 0.12) * randomFloat(ranges.budgetMultiplier[0], ranges.budgetMultiplier[1]);
  const relatedSpendM = annualBudgetM * randomFloat(ranges.spendRatio[0], ranges.spendRatio[1]);

  const procurementReadiness = randomInt(ranges.procurementReadiness[0], ranges.procurementReadiness[1]);
  const complianceUrgency = randomInt(ranges.complianceUrgency[0], ranges.complianceUrgency[1]);
  const regulatoryComplexity = randomInt(ranges.regulatoryComplexity[0], ranges.regulatoryComplexity[1]);
  const cyberPressure = randomInt(ranges.cyberPressure[0], ranges.cyberPressure[1]);

  const scored = scoreLead({
    headcount: seed.headcount,
    annualBudgetM,
    relatedSpendM,
    governanceRolePresent: role.present,
    procurementReadiness,
    complianceUrgency,
    regulatoryComplexity,
    cyberPressure
  });

  return {
    orgName: seed.orgName,
    agencyName: seed.agencyName,
    segment: seed.segment,
    website: seed.website,
    phone: seed.phone,
    headcount: seed.headcount,
    annualBudgetM: round2(annualBudgetM),
    relatedSpendM: round2(relatedSpendM),
    governanceRoleTitle: role.title,
    governanceRolePresent: role.present,
    procurementReadiness,
    complianceUrgency,
    regulatoryComplexity,
    cyberPressure,
    icpScore: scored.total,
    icpGrade: scored.grade,
    fitBand: scored.fitBand,
    considerable: scored.considerable,
    status: "generated",
    priorityRank: null,
    rationale: JSON.stringify({
      reasons: scored.reasons,
      componentScores: scored.componentScores,
      thresholds: enterpriseICPProfile.enterpriseCriteria,
      disclosure: enterpriseICPProfile.syntheticDisclosure
    }),
    fieldProvenance: JSON.stringify({
      orgName: "Public reference (office-level variation may be simulated)",
      agencyName: "Public reference",
      website: "Public reference",
      phone: "Public reference",
      headcount: "Estimated public proxy",
      annualBudgetM: "Synthetic realistic simulation",
      relatedSpendM: "Synthetic realistic simulation",
      governanceRoleTitle: "Synthetic realistic simulation",
      procurementReadiness: "Synthetic realistic simulation",
      complianceUrgency: "Synthetic realistic simulation",
      regulatoryComplexity: "Synthetic realistic simulation",
      cyberPressure: "Synthetic realistic simulation"
    })
  };
}

export function generateSyntheticLeads(
  count: number,
  requestedMix?: Partial<GradeMix>
): GenerateLeadsResult {
  const leadCount = Math.min(Math.max(count, 10), 250);
  const mix = normalizeMix(requestedMix);
  const targets = buildTargets(leadCount, mix);

  const leads: LeadDraft[] = [];

  for (const target of targets) {
    let accepted = generateOne(target);

    for (let attempt = 0; attempt < 35; attempt += 1) {
      const candidate = generateOne(target);
      const allowOutsideTail = target === "D" && candidate.icpGrade === "F" && Math.random() < 0.35;
      if (candidate.icpGrade === target || allowOutsideTail) {
        accepted = candidate;
        break;
      }

      // Keep best candidate close to the target band center.
      const targetCenter = target === "A" ? 92 : target === "B" ? 78 : target === "C" ? 65 : 52;
      const acceptedDelta = Math.abs(accepted.icpScore - targetCenter);
      const candidateDelta = Math.abs(candidate.icpScore - targetCenter);
      if (candidateDelta < acceptedDelta) {
        accepted = candidate;
      }
    }

    leads.push(accepted);
  }

  const orgCounts = new Map<string, number>();
  for (const lead of leads) {
    const seen = (orgCounts.get(lead.orgName) ?? 0) + 1;
    orgCounts.set(lead.orgName, seen);
    if (seen > 1) {
      const officeName = officeVariants[(seen - 2) % officeVariants.length];
      lead.orgName = `${lead.orgName} - ${officeName}`;
    }
  }

  const gradeCounts: Record<GradeLabel, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0
  };

  const fitBandCounts: Record<string, number> = {};

  for (const lead of leads) {
    gradeCounts[lead.icpGrade] += 1;
    fitBandCounts[lead.fitBand] = (fitBandCounts[lead.fitBand] ?? 0) + 1;
  }

  return {
    leads,
    summary: {
      total: leads.length,
      gradeCounts,
      fitBandCounts,
      considerableCount: leads.filter((lead) => lead.considerable).length,
      targetMix: mix,
      disclosure: enterpriseICPProfile.syntheticDisclosure
    }
  };
}

export function sortSyntheticLeads(
  leads: Array<{
    id: string;
    orgName: string;
    icpGrade: string;
    icpScore: number;
    relatedSpendM: number;
    procurementReadiness: number;
    considerable: boolean;
  }>
): SortResult {
  const sorted = [...leads].sort((a, b) => {
    if (a.considerable !== b.considerable) {
      return a.considerable ? -1 : 1;
    }
    if (b.icpScore !== a.icpScore) {
      return b.icpScore - a.icpScore;
    }
    if (b.relatedSpendM !== a.relatedSpendM) {
      return b.relatedSpendM - a.relatedSpendM;
    }
    return b.procurementReadiness - a.procurementReadiness;
  });

  let rank = 1;
  const updates = sorted.map((lead) => {
    if (!lead.considerable) {
      return {
        id: lead.id,
        priorityRank: null,
        status: "discarded"
      };
    }

    const mapped = {
      id: lead.id,
      priorityRank: rank,
      status: "queued"
    };
    rank += 1;
    return mapped;
  });

  const topHandoff = sorted
    .filter((lead) => lead.considerable)
    .slice(0, 10)
    .map((lead, index) => ({
      orgName: lead.orgName,
      icpGrade: lead.icpGrade,
      icpScore: round2(lead.icpScore),
      priorityRank: index + 1
    }));

  return {
    updates,
    summary: {
      sortedCount: updates.length,
      queuedCount: updates.filter((entry) => entry.status === "queued").length,
      discardedCount: updates.filter((entry) => entry.status === "discarded").length,
      topHandoff
    }
  };
}
