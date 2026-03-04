import type { NormalizedOpportunity } from "@/packages/core/types";

export type FetchSamParams = {
  limit?: number;
  daysBack?: number;
  naicsCodes?: string[];
  requireWaRelevance?: boolean;
};

type SamSearchRequest = {
  apiKey: string;
  limit: number;
  from: Date;
  to: Date;
  naicsCodes?: string[];
};

function formatSamDate(date: Date): string {
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${month}/${day}/${year}`;
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return null;
}

function extractNaics(raw: Record<string, unknown>): string[] {
  const collected = new Set<string>();

  const addMaybe = (value: unknown): void => {
    if (typeof value === "string") {
      value
        .split(/[;,\s]+/)
        .map((token) => token.trim())
        .filter((token) => /^\d{6}$/.test(token))
        .forEach((token) => collected.add(token));
    }
  };

  addMaybe(raw.naicsCode);
  addMaybe(raw.naicsCodes);
  addMaybe(raw.classificationCode);

  const nested = raw.classification as Record<string, unknown> | undefined;
  if (nested) {
    addMaybe(nested.naics);
    addMaybe(nested.naicsCode);
  }

  return Array.from(collected);
}

function extractPlace(raw: Record<string, unknown>): { placeOfPerformance: string | null; waRelevant: boolean } {
  const pop = raw.placeOfPerformance as Record<string, unknown> | undefined;

  const city = asString(pop?.city) ?? asString(raw.popCity);
  const state =
    asString(pop?.stateCode) ?? asString(pop?.state) ?? asString(raw.popState);

  const place = [city, state].filter(Boolean).join(", ") || null;

  const textPool = `${place ?? ""} ${asString(raw.title) ?? ""} ${asString(raw.description) ?? ""}`.toLowerCase();
  const waRelevant = state?.toUpperCase() === "WA" || textPool.includes("washington");

  return { placeOfPerformance: place, waRelevant };
}

function normalizeSamRecord(raw: Record<string, unknown>): NormalizedOpportunity | null {
  const sourceId =
    asString(raw.noticeId) ?? asString(raw.solicitationNumber) ?? asString(raw.id) ?? asString(raw.opportunityId);

  const title = asString(raw.title) ?? asString(raw.solicitationTitle) ?? "Untitled opportunity";
  const agency =
    asString(raw.fullParentPathName) ?? asString(raw.departmentIndAgency) ?? asString(raw.organizationName) ?? "Unknown agency";

  const postedDate =
    parseDate(raw.postedDate) ?? parseDate(raw.publishedDate) ?? parseDate(raw.publishDate) ?? parseDate(raw.createdDate);

  const dueDate =
    parseDate(raw.responseDeadLine) ?? parseDate(raw.responseDate) ?? parseDate(raw.closeDate) ?? parseDate(raw.archiveDate);

  if (!sourceId || !postedDate) {
    console.warn("SAM normalization skipped a record due to missing sourceId or postedDate", {
      sourceId,
      postedDate
    });
    return null;
  }

  const url =
    asString(raw.uiLink) ??
    asString(raw.link) ??
    `https://sam.gov/opp/${encodeURIComponent(sourceId)}/view`;

  const office = asString(raw.office) ?? asString(raw.subTier) ?? null;
  const setAside = asString(raw.typeOfSetAsideDescription) ?? asString(raw.setAside) ?? null;
  const description = asString(raw.description) ?? asString(raw.additionalInfo) ?? null;

  const { placeOfPerformance, waRelevant } = extractPlace(raw);

  return {
    source: "sam",
    sourceId,
    title,
    agency,
    office,
    postedDate,
    dueDate,
    naics: extractNaics(raw),
    setAside,
    placeOfPerformance,
    waRelevant,
    url,
    description,
    enrichment: null
  };
}

async function requestSamRows(args: SamSearchRequest): Promise<unknown[]> {
  const endpoint = new URL("https://api.sam.gov/prod/opportunities/v2/search");
  endpoint.searchParams.set("api_key", args.apiKey);
  endpoint.searchParams.set("limit", String(args.limit));
  endpoint.searchParams.set("postedFrom", formatSamDate(args.from));
  endpoint.searchParams.set("postedTo", formatSamDate(args.to));

  if (args.naicsCodes && args.naicsCodes.length > 0) {
    endpoint.searchParams.set("ncode", args.naicsCodes.join(","));
  }

  const response = await fetch(endpoint.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SAM request failed (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as {
    opportunitiesData?: unknown[];
    data?: unknown[];
    results?: unknown[];
  };

  const rows = payload.opportunitiesData ?? payload.data ?? payload.results;
  if (!Array.isArray(rows)) {
    throw new Error("SAM response format changed: expected opportunities array field");
  }

  return rows;
}

export async function fetchOpportunities(params: FetchSamParams = {}): Promise<NormalizedOpportunity[]> {
  const apiKey = process.env.SAM_API_KEY;
  if (!apiKey) {
    throw new Error("SAM_API_KEY is not configured");
  }

  const limit = Math.min(Math.max(params.limit ?? 150, 1), 200);
  const daysBack = Math.max(params.daysBack ?? 14, 1);

  const from = new Date();
  from.setUTCDate(from.getUTCDate() - daysBack);
  const to = new Date();
  let rows = await requestSamRows({
    apiKey,
    limit,
    from,
    to,
    naicsCodes: params.naicsCodes
  });

  let usedFallback = false;
  if (rows.length === 0 && params.naicsCodes && params.naicsCodes.length > 0) {
    usedFallback = true;
    const fallbackFrom = new Date();
    fallbackFrom.setUTCDate(fallbackFrom.getUTCDate() - Math.max(daysBack, 30));

    const fallbackLimit = Math.min(200, Math.max(limit * 2, 100));
    console.warn(
      "SAM NAICS query returned zero rows; retrying broad query and applying NAICS filter locally",
      { daysBack, fallbackDaysBack: Math.max(daysBack, 30), fallbackLimit }
    );

    rows = await requestSamRows({
      apiKey,
      limit: fallbackLimit,
      from: fallbackFrom,
      to
    });
  }

  const normalized = rows
    .map((row) => (row && typeof row === "object" ? normalizeSamRecord(row as Record<string, unknown>) : null))
    .filter((row): row is NormalizedOpportunity => row !== null);

  const filtered = normalized.filter((opp) => {
    const matchesNaics =
      !params.naicsCodes || params.naicsCodes.length === 0
        ? true
        : opp.naics.some((naics) => params.naicsCodes?.includes(naics));

    const matchesWa = params.requireWaRelevance ? opp.waRelevant : true;

    return matchesNaics && matchesWa;
  });

  if (filtered.length === 0 && usedFallback) {
    console.warn("SAM fallback yielded no local NAICS matches; returning broad latest opportunities", {
      normalizedCount: normalized.length,
      limit
    });
    return normalized
      .filter((opp) => (params.requireWaRelevance ? opp.waRelevant : true))
      .slice(0, limit);
  }

  return filtered.slice(0, limit);
}
