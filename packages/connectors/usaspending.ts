export type AgencyContext = {
  agencyName?: string;
  topTierCode?: string;
  spend3y?: number;
  topRecipients?: Array<{ name: string; amount?: number }>;
  sourceNotes?: string;
};

function normalizeAgencyName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

async function resolveTopTierAgency(agencyNameOrCode: string): Promise<{ name?: string; code?: string }> {
  const query = normalizeAgencyName(agencyNameOrCode);

  const response = await fetch("https://api.usaspending.gov/api/v2/autocomplete/awarding_agency/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ search_text: query })
  });

  if (!response.ok) {
    throw new Error(`USAspending autocomplete failed (${response.status})`);
  }

  const payload = (await response.json()) as {
    results?: Array<{
      toptier_code?: string;
      toptier_agency?: { name?: string; toptier_code?: string };
      title?: string;
      name?: string;
    }>;
  };

  const match = payload.results?.[0];
  if (!match) {
    return {};
  }

  return {
    name: match.toptier_agency?.name ?? match.title ?? match.name,
    code: match.toptier_agency?.toptier_code ?? match.toptier_code
  };
}

async function fetchSpendingOverTime(topTierCode: string): Promise<number | undefined> {
  const now = new Date();
  const endYear = now.getUTCFullYear() - 1;
  const startYear = endYear - 2;

  const response = await fetch("https://api.usaspending.gov/api/v2/search/spending_over_time/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      group: "fiscal_year",
      filters: {
        agencies: [
          {
            type: "awarding",
            tier: "toptier",
            toptier_code: topTierCode
          }
        ],
        time_period: [
          {
            start_date: `${startYear}-10-01`,
            end_date: `${endYear}-09-30`
          }
        ]
      }
    })
  });

  if (!response.ok) {
    throw new Error(`USAspending spend-over-time failed (${response.status})`);
  }

  const payload = (await response.json()) as {
    results?: Array<{ aggregated_amount?: number | string }>;
  };

  if (!Array.isArray(payload.results) || payload.results.length === 0) {
    return undefined;
  }

  const total = payload.results.reduce((sum, row) => {
    const amount = typeof row.aggregated_amount === "number" ? row.aggregated_amount : Number(row.aggregated_amount);
    return Number.isFinite(amount) ? sum + amount : sum;
  }, 0);

  return Number.isFinite(total) ? total : undefined;
}

export async function fetchAgencyContext(agencyNameOrCode: string): Promise<AgencyContext> {
  if (!agencyNameOrCode || !agencyNameOrCode.trim()) {
    return { sourceNotes: "Agency name missing" };
  }

  try {
    const topTier = await resolveTopTierAgency(agencyNameOrCode);

    if (!topTier.code) {
      return {
        agencyName: topTier.name,
        sourceNotes: "No top-tier agency code resolved from USAspending"
      };
    }

    const spend3y = await fetchSpendingOverTime(topTier.code).catch((error) => {
      console.warn("USAspending spend lookup failed", error);
      return undefined;
    });

    return {
      agencyName: topTier.name,
      topTierCode: topTier.code,
      spend3y,
      sourceNotes: spend3y
        ? "Spend context derived from USAspending spending_over_time"
        : "Spend context unavailable from USAspending response"
    };
  } catch (error) {
    console.warn("USAspending context lookup failed", error);
    return {
      sourceNotes: `USAspending lookup failed: ${error instanceof Error ? error.message : "unknown error"}`
    };
  }
}
