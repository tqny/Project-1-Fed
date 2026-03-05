export type GradeBand = {
  minScore: number;
  maxScore: number;
  label: "A" | "B" | "C" | "D" | "F";
  fitBand: "Ideal" | "Acceptable-Strong" | "Acceptable-Moderate" | "Borderline" | "Outside";
  considerable: boolean;
};

export type EnterpriseICPProfile = {
  profileName: string;
  pretendCompany: string;
  pretendOffering: string;
  targetSegments: string[];
  enterpriseCriteria: {
    ideal: {
      minHeadcount: number;
      minAnnualBudgetM: number;
      minRelatedSpendM: number;
    };
    acceptable: {
      minHeadcount: number;
      minAnnualBudgetM: number;
      minRelatedSpendM: number;
    };
  };
  gradingWeights: {
    scaleAndBudget: number;
    spendPropensity: number;
    organizationalReadiness: number;
    urgencyPressure: number;
  };
  gradeBands: GradeBand[];
  syntheticDisclosure: string;
};

export const enterpriseICPProfile: EnterpriseICPProfile = {
  profileName: "Federal Enterprise AI Compliance ICP",
  pretendCompany: "Northline Compliance Systems",
  pretendOffering:
    "AI compliance and governance operations platform for federal and defense organizations with high assurance, auditability, and workflow controls.",
  targetSegments: ["Federal Civilian", "Defense/Military", "Intelligence Support"],
  enterpriseCriteria: {
    ideal: {
      minHeadcount: 15000,
      minAnnualBudgetM: 1200,
      minRelatedSpendM: 90
    },
    acceptable: {
      minHeadcount: 7500,
      minAnnualBudgetM: 500,
      minRelatedSpendM: 25
    }
  },
  gradingWeights: {
    scaleAndBudget: 0.32,
    spendPropensity: 0.28,
    organizationalReadiness: 0.24,
    urgencyPressure: 0.16
  },
  gradeBands: [
    {
      minScore: 85,
      maxScore: 100,
      label: "A",
      fitBand: "Ideal",
      considerable: true
    },
    {
      minScore: 72,
      maxScore: 84.99,
      label: "B",
      fitBand: "Acceptable-Strong",
      considerable: true
    },
    {
      minScore: 58,
      maxScore: 71.99,
      label: "C",
      fitBand: "Acceptable-Moderate",
      considerable: true
    },
    {
      minScore: 45,
      maxScore: 57.99,
      label: "D",
      fitBand: "Borderline",
      considerable: false
    },
    {
      minScore: 0,
      maxScore: 44.99,
      label: "F",
      fitBand: "Outside",
      considerable: false
    }
  ],
  syntheticDisclosure:
    "Entity identity fields are based on public organizational references; budget, spend, role-readiness, and urgency values are synthetic simulations for demo use only."
};

export function resolveGradeBand(score: number): GradeBand {
  const band = enterpriseICPProfile.gradeBands.find((entry) => score >= entry.minScore && score <= entry.maxScore);
  return band ?? enterpriseICPProfile.gradeBands[enterpriseICPProfile.gradeBands.length - 1];
}
