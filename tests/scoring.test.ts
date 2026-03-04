import assert from "node:assert/strict";
import test from "node:test";

import { activeProductProfile } from "@/config/productProfile";
import { scoreOpportunity } from "@/packages/core/scoring";

test("scoreOpportunity returns explainable deterministic output", () => {
  const sample = {
    source: "sam" as const,
    sourceId: "SAM-123",
    title: "Compliance automation support services",
    agency: "Department of Energy",
    office: null,
    postedDate: new Date("2026-03-01T00:00:00.000Z"),
    dueDate: new Date("2026-03-20T00:00:00.000Z"),
    naics: ["541511"],
    setAside: null,
    placeOfPerformance: "Seattle, WA",
    waRelevant: true,
    url: "https://sam.gov/example",
    description: "FedRAMP governance workflow automation and risk monitoring support.",
    enrichment: {
      spend3y: 120000000
    }
  };

  const result = scoreOpportunity(sample, activeProductProfile);

  assert.ok(result.total >= 0 && result.total <= 100);
  assert.ok(result.breakdown.fit > 0);
  assert.ok(result.breakdown.reasons.length > 0);
  assert.ok(result.breakdown.details.signal.length > 0);
});
