export type ProductProfile = {
  name: string;
  description: string;
  target_naics: string[];
  target_agencies: string[];
  keywords_positive: string[];
  keywords_negative: string[];
  weights: {
    fit: number;
    timing: number;
    signal: number;
    complexity: number;
  };
};

export const activeProductProfile: ProductProfile = {
  name: "AI Compliance & Workflow Automation Platform",
  description:
    "Operationalizes compliance, audit-readiness, and workflow automation for regulated environments with strong governance and security controls.",
  target_naics: ["541511", "541512", "541519"],
  target_agencies: [],
  keywords_positive: [
    "compliance",
    "audit",
    "security",
    "governance",
    "workflow",
    "automation",
    "risk",
    "controls",
    "ATO",
    "FedRAMP",
    "GRC",
    "policy"
  ],
  keywords_negative: [
    "construction",
    "HVAC",
    "janitorial",
    "landscaping",
    "roofing",
    "plumbing",
    "concrete",
    "asphalt"
  ],
  weights: {
    fit: 0.45,
    timing: 0.2,
    signal: 0.2,
    complexity: 0.15
  }
};

export function assertValidWeights(profile: ProductProfile): void {
  const total =
    profile.weights.fit +
    profile.weights.timing +
    profile.weights.signal +
    profile.weights.complexity;

  if (Math.abs(total - 1) > 0.001) {
    throw new Error(`ProductProfile weights must sum to 1.0. Received ${total.toFixed(3)}.`);
  }
}
