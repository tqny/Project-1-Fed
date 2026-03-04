import type { ProductProfile } from "@/config/productProfile";

export type NormalizedOpportunity = {
  source: "sam";
  sourceId: string;
  title: string;
  agency: string;
  office?: string | null;
  postedDate: Date;
  dueDate?: Date | null;
  naics: string[];
  setAside?: string | null;
  placeOfPerformance?: string | null;
  waRelevant: boolean;
  url: string;
  description?: string | null;
  enrichment?: Record<string, unknown> | null;
};

export type ScoreBreakdown = {
  fit: number;
  timing: number;
  signal: number;
  complexity: number;
  weightedTotal: number;
  reasons: string[];
  details: {
    fit: string[];
    timing: string[];
    signal: string[];
    complexity: string[];
  };
};

export type OpportunityBrief = {
  summary: string;
  whyItMatters: string[];
  suggestedOutreachAngle: string;
  discoveryQuestions: string[];
  risksUnknowns: string[];
  nextStep: string;
};

export type BriefInput = {
  opportunity: NormalizedOpportunity;
  productProfile: ProductProfile;
  scoreBreakdown: ScoreBreakdown;
};
