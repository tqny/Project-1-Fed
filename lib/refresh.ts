import { activeProductProfile, assertValidWeights } from "@/config/productProfile";
import { prisma } from "@/lib/db";
import { fetchOpportunities } from "@/packages/connectors/sam";
import { fetchAgencyContext } from "@/packages/connectors/usaspending";
import { generateOpportunityBrief } from "@/packages/core/brief";
import { scoreOpportunity } from "@/packages/core/scoring";
import type { NormalizedOpportunity } from "@/packages/core/types";

export type RefreshSummary = {
  runId?: string;
  countFetched: number;
  countUpserted: number;
  countEnriched: number;
  countScored: number;
  countBriefed: number;
  errors: string[];
};

function serializeJson(value: unknown): string {
  return JSON.stringify(value ?? {});
}

function normalizeFromDb(record: {
  source: string;
  sourceId: string;
  title: string;
  agency: string;
  office: string | null;
  postedDate: Date;
  dueDate: Date | null;
  naics: string;
  setAside: string | null;
  placeOfPerformance: string | null;
  waRelevant: boolean;
  url: string;
  description: string | null;
  enrichment: string | null;
}): NormalizedOpportunity {
  let parsedNaics: string[] = [];
  try {
    const parsed = JSON.parse(record.naics);
    if (Array.isArray(parsed)) {
      parsedNaics = parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    parsedNaics = [];
  }

  let parsedEnrichment: Record<string, unknown> | null = null;
  if (record.enrichment) {
    try {
      const parsed = JSON.parse(record.enrichment);
      if (parsed && typeof parsed === "object") {
        parsedEnrichment = parsed as Record<string, unknown>;
      }
    } catch {
      parsedEnrichment = null;
    }
  }

  return {
    source: record.source === "sam" ? "sam" : "sam",
    sourceId: record.sourceId,
    title: record.title,
    agency: record.agency,
    office: record.office,
    postedDate: record.postedDate,
    dueDate: record.dueDate,
    naics: parsedNaics,
    setAside: record.setAside,
    placeOfPerformance: record.placeOfPerformance,
    waRelevant: record.waRelevant,
    url: record.url,
    description: record.description,
    enrichment: parsedEnrichment
  };
}

export async function runRefreshPipeline(limit = 150): Promise<RefreshSummary> {
  assertValidWeights(activeProductProfile);

  const summary: RefreshSummary = {
    runId: undefined,
    countFetched: 0,
    countUpserted: 0,
    countEnriched: 0,
    countScored: 0,
    countBriefed: 0,
    errors: []
  };

  const run = await prisma.refreshRun.create({
    data: {
      status: "running"
    }
  });
  summary.runId = run.id;

  const finalizeRun = async (status: "completed" | "completed_with_errors" | "failed"): Promise<void> => {
    try {
      await prisma.refreshRun.update({
        where: { id: run.id },
        data: {
          status,
          countFetched: summary.countFetched,
          countUpserted: summary.countUpserted,
          countEnriched: summary.countEnriched,
          countScored: summary.countScored,
          countBriefed: summary.countBriefed,
          errors: serializeJson(summary.errors),
          finishedAt: new Date()
        }
      });
    } catch (error) {
      console.error("Failed to persist refresh run summary", error);
    }
  };

  let fetched: NormalizedOpportunity[] = [];

  try {
    fetched = await fetchOpportunities({
      limit,
      daysBack: 14,
      naicsCodes: activeProductProfile.target_naics
    });
    summary.countFetched = fetched.length;
  } catch (error) {
    summary.errors.push(`Fetch failed: ${error instanceof Error ? error.message : "unknown error"}`);
    await finalizeRun("failed");
    return summary;
  }

  const upsertedSourceIds: string[] = [];

  for (const opp of fetched) {
    try {
      await prisma.opportunity.upsert({
        where: { sourceId: opp.sourceId },
        create: {
          source: opp.source,
          sourceId: opp.sourceId,
          title: opp.title,
          agency: opp.agency,
          office: opp.office,
          postedDate: opp.postedDate,
          dueDate: opp.dueDate,
          naics: serializeJson(opp.naics),
          setAside: opp.setAside,
          placeOfPerformance: opp.placeOfPerformance,
          waRelevant: opp.waRelevant,
          url: opp.url,
          description: opp.description,
          status: "new"
        },
        update: {
          title: opp.title,
          agency: opp.agency,
          office: opp.office,
          postedDate: opp.postedDate,
          dueDate: opp.dueDate,
          naics: serializeJson(opp.naics),
          setAside: opp.setAside,
          placeOfPerformance: opp.placeOfPerformance,
          waRelevant: opp.waRelevant,
          url: opp.url,
          description: opp.description
        }
      });
      upsertedSourceIds.push(opp.sourceId);
      summary.countUpserted += 1;
    } catch (error) {
      summary.errors.push(
        `Upsert failed for ${opp.sourceId}: ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }

  const upsertedRecords = await prisma.opportunity.findMany({
    where: {
      sourceId: {
        in: upsertedSourceIds
      }
    }
  });

  const agencyCache = new Map<string, Awaited<ReturnType<typeof fetchAgencyContext>>>();

  for (const record of upsertedRecords) {
    try {
      const key = record.agency.toLowerCase();

      let context = agencyCache.get(key);
      if (!context) {
        context = await fetchAgencyContext(record.agency);
        agencyCache.set(key, context);
      }

      await prisma.opportunity.update({
        where: { id: record.id },
        data: {
          enrichment: serializeJson(context)
        }
      });

      summary.countEnriched += 1;
    } catch (error) {
      summary.errors.push(
        `Enrichment failed for ${record.sourceId}: ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }

  const enrichedRecords = await prisma.opportunity.findMany({
    where: {
      sourceId: {
        in: upsertedSourceIds
      }
    }
  });

  for (const record of enrichedRecords) {
    try {
      const normalized = normalizeFromDb(record);
      const scored = scoreOpportunity(normalized, activeProductProfile);

      await prisma.opportunity.update({
        where: { id: record.id },
        data: {
          scoreTotal: scored.total,
          scoreBreakdown: serializeJson(scored.breakdown)
        }
      });

      summary.countScored += 1;

      const brief = await generateOpportunityBrief({
        opportunity: normalized,
        productProfile: activeProductProfile,
        scoreBreakdown: scored.breakdown
      });

      await prisma.opportunity.update({
        where: { id: record.id },
        data: {
          brief: serializeJson(brief)
        }
      });

      summary.countBriefed += 1;
    } catch (error) {
      summary.errors.push(
        `Scoring/brief failed for ${record.sourceId}: ${error instanceof Error ? error.message : "unknown error"}`
      );
    }
  }

  await finalizeRun(summary.errors.length > 0 ? "completed_with_errors" : "completed");
  return summary;
}
