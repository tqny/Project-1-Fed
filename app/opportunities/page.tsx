import Link from "next/link";

import { LeadConsoleShell } from "@/components/lead-console-shell";
import { LeadOpsControls } from "@/components/lead-ops-controls";
import { enterpriseICPProfile } from "@/config/icpProfile";
import { prisma } from "@/lib/db";

type OverviewPageProps = {
  searchParams: Promise<{
    agency?: string;
    grade?: string;
    status?: string;
    considerable?: string;
  }>;
};

function mapRunStatusToClass(status: string): string {
  if (status === "completed") return "status status-success";
  if (status === "running") return "status status-running";
  if (status === "completed_with_errors") return "status status-warn";
  if (status === "failed") return "status status-error";
  return "status";
}

function pct(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function safeParseArray(input: string): string[] {
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      return parsed.filter((entry): entry is string => typeof entry === "string");
    }
  } catch {
    return [];
  }
  return [];
}

function safeParseSortSummary(input: string): Array<{ orgName: string; icpGrade: string; icpScore: number; priorityRank: number }> {
  try {
    const parsed = JSON.parse(input) as {
      topHandoff?: Array<{ orgName?: string; icpGrade?: string; icpScore?: number; priorityRank?: number }>;
    };
    if (!Array.isArray(parsed.topHandoff)) return [];
    return parsed.topHandoff.filter(
      (
        entry
      ): entry is {
        orgName: string;
        icpGrade: string;
        icpScore: number;
        priorityRank: number;
      } =>
        typeof entry.orgName === "string" &&
        typeof entry.icpGrade === "string" &&
        typeof entry.icpScore === "number" &&
        typeof entry.priorityRank === "number"
    );
  } catch {
    return [];
  }
}

export default async function OverviewPage({ searchParams }: OverviewPageProps) {
  const params = await searchParams;
  const filterAgency = params.agency?.trim() ?? "";
  const filterGrade = params.grade?.trim() ?? "";
  const filterStatus = params.status?.trim() ?? "";
  const filterConsiderable = params.considerable === "1";
  const hasActiveFilters = Boolean(filterAgency || filterGrade || filterStatus || filterConsiderable);

  const [latestGenerateRun, latestSortRun, leads] = await Promise.all([
    prisma.leadRun.findFirst({
      where: { runType: "generate" },
      orderBy: { startedAt: "desc" }
    }),
    prisma.leadRun.findFirst({
      where: { runType: "sort" },
      orderBy: { startedAt: "desc" }
    }),
    prisma.lead.findMany({
      where: {
        ...(filterAgency ? { agencyName: { contains: filterAgency } } : {}),
        ...(filterGrade ? { icpGrade: filterGrade } : {}),
        ...(filterStatus ? { status: filterStatus } : {}),
        ...(filterConsiderable ? { considerable: true } : {})
      },
      orderBy: [{ priorityRank: "asc" }, { icpScore: "desc" }, { relatedSpendM: "desc" }],
      take: 300
    })
  ]);

  const totalLeads = leads.length;
  const gradeCounts = {
    A: leads.filter((lead) => lead.icpGrade === "A").length,
    B: leads.filter((lead) => lead.icpGrade === "B").length,
    C: leads.filter((lead) => lead.icpGrade === "C").length,
    D: leads.filter((lead) => lead.icpGrade === "D").length,
    F: leads.filter((lead) => lead.icpGrade === "F").length
  };
  const queued = leads.filter((lead) => lead.status === "queued").length;
  const discarded = leads.filter((lead) => lead.status === "discarded").length;
  const generated = leads.filter((lead) => lead.status === "generated").length;
  const considerableCount = leads.filter((lead) => lead.considerable).length;
  const avgScore = totalLeads === 0 ? 0 : leads.reduce((sum, lead) => sum + lead.icpScore, 0) / totalLeads;
  const avgBudgetM = totalLeads === 0 ? 0 : leads.reduce((sum, lead) => sum + lead.annualBudgetM, 0) / totalLeads;

  const agencies = new Map<string, number>();
  for (const lead of leads) {
    agencies.set(lead.agencyName, (agencies.get(lead.agencyName) ?? 0) + 1);
  }
  const topAgencies = [...agencies.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([agency, count]) => ({ agency, count }));

  const latestGenerateErrors = latestGenerateRun ? safeParseArray(latestGenerateRun.errors) : [];
  const latestSortErrors = latestSortRun ? safeParseArray(latestSortRun.errors) : [];
  const topHandoff = latestSortRun ? safeParseSortSummary(latestSortRun.summary).slice(0, 6) : [];

  return (
    <LeadConsoleShell
      activePage="overview"
      title="Live Dashboard"
      description="Visual command view for lead generation, agent sorting, and queue prioritization."
      badge="Operations mode"
      actions={
        <>
          <LeadOpsControls />
          <div className="row">
            <span className={mapRunStatusToClass(latestGenerateRun?.status ?? "idle")}>
              generate: {latestGenerateRun?.status ?? "idle"}
            </span>
            <span className={mapRunStatusToClass(latestSortRun?.status ?? "idle")}>sort: {latestSortRun?.status ?? "idle"}</span>
            <span className="meta">{enterpriseICPProfile.syntheticDisclosure}</span>
          </div>
          {latestGenerateErrors.length > 0 ? (
            <details className="callout callout-warn">
              <summary>Generation errors ({latestGenerateErrors.length})</summary>
              <ul>
                {latestGenerateErrors.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </details>
          ) : null}
          {latestSortErrors.length > 0 ? (
            <details className="callout callout-warn">
              <summary>Sort errors ({latestSortErrors.length})</summary>
              <ul>
                {latestSortErrors.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </>
      }
    >
      <section className="ops-kpi-grid">
        <article className="card kpi-card kpi-card-accent">
          <p className="meta">Leads in scope</p>
          <h2>{totalLeads}</h2>
          <p className="meta">Current filter window</p>
        </article>
        <article className="card kpi-card">
          <p className="meta">Considerable (A-C)</p>
          <h2>{considerableCount}</h2>
          <p className="meta">{pct(considerableCount, totalLeads)}% of visible pipeline</p>
        </article>
        <article className="card kpi-card">
          <p className="meta">Queued for review</p>
          <h2>{queued}</h2>
          <p className="meta">
            Generated {generated} | Discarded {discarded}
          </p>
        </article>
        <article className="card kpi-card">
          <p className="meta">Average ICP score</p>
          <h2>{avgScore.toFixed(1)}</h2>
          <p className="meta">Avg simulated budget ${avgBudgetM.toFixed(0)}M</p>
        </article>
      </section>

      <section className="ops-analysis-grid">
        <article className="card stack">
          <div className="row row-between">
            <h2>Grade Mix</h2>
            <span className="meta">A/B/C/D/F distribution</span>
          </div>
          <div className="stack">
            {(["A", "B", "C", "D", "F"] as const).map((grade) => (
              <div className="bar-row" key={grade}>
                <span>{grade}</span>
                <div className="bar-track">
                  <div className="bar-fill accent" style={{ width: `${pct(gradeCounts[grade], totalLeads)}%` }} />
                </div>
                <span>{gradeCounts[grade]}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card stack">
          <div className="row row-between">
            <h2>Queue Health</h2>
            <span className="meta">Workflow distribution</span>
          </div>
          <div className="stack">
            <div className="bar-row">
              <span>Queued</span>
              <div className="bar-track">
                <div className="bar-fill success" style={{ width: `${pct(queued, totalLeads)}%` }} />
              </div>
              <span>{queued}</span>
            </div>
            <div className="bar-row">
              <span>Generated</span>
              <div className="bar-track">
                <div className="bar-fill accent" style={{ width: `${pct(generated, totalLeads)}%` }} />
              </div>
              <span>{generated}</span>
            </div>
            <div className="bar-row">
              <span>Discarded</span>
              <div className="bar-track">
                <div className="bar-fill muted" style={{ width: `${pct(discarded, totalLeads)}%` }} />
              </div>
              <span>{discarded}</span>
            </div>
          </div>
        </article>
      </section>

      <section className="ops-analysis-grid">
        <article className="card stack">
          <div className="row row-between">
            <h2>Top Agencies</h2>
            <span className="meta">Concentration map</span>
          </div>
          {topAgencies.length === 0 ? (
            <p className="meta">Generate leads to populate agency distribution.</p>
          ) : (
            <ul className="rank-list">
              {topAgencies.map((entry) => (
                <li className="rank-row" key={entry.agency}>
                  <span>{entry.agency}</span>
                  <span className="pill">{entry.count}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="card stack">
          <div className="row row-between">
            <h2>Agent Handoff</h2>
            <span className="meta">Top ranked queue from latest sort</span>
          </div>
          {topHandoff.length === 0 ? (
            <p className="meta">Run Sorting Agent to populate handoff preview.</p>
          ) : (
            <ul className="rank-list">
              {topHandoff.map((entry) => (
                <li className="rank-row" key={`${entry.priorityRank}-${entry.orgName}`}>
                  <span>
                    #{entry.priorityRank} {entry.orgName}
                  </span>
                  <span className="pill">
                    {entry.icpGrade} {entry.icpScore.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="card stack">
        <div className="row row-between">
          <h2>Filters + Ranked Pipeline</h2>
          {hasActiveFilters ? (
            <Link href="/opportunities" className="meta link-accent">
              Clear filters
            </Link>
          ) : null}
        </div>
        <form className="row" method="GET">
          <input name="agency" placeholder="Agency contains" defaultValue={filterAgency} />
          <select name="grade" defaultValue={filterGrade}>
            <option value="">Any grade</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="F">F</option>
          </select>
          <select name="status" defaultValue={filterStatus}>
            <option value="">Any status</option>
            <option value="generated">generated</option>
            <option value="queued">queued</option>
            <option value="discarded">discarded</option>
          </select>
          <label className="row row-tight">
            <input type="checkbox" name="considerable" value="1" defaultChecked={filterConsiderable} /> Considerable only
          </label>
          <button type="submit">Apply filters</button>
        </form>

        <div className="flow-x">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Grade</th>
                <th>Score</th>
                <th>Organization</th>
                <th>Agency</th>
                <th>Headcount</th>
                <th>Budget (M)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="callout callout-warn">
                      No leads in the current filter set. Generate leads or adjust filters.
                    </div>
                  </td>
                </tr>
              ) : (
                leads.slice(0, 60).map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.priorityRank ?? "—"}</td>
                    <td>
                      <span className="pill">{lead.icpGrade}</span>
                    </td>
                    <td>{lead.icpScore.toFixed(1)}</td>
                    <td>
                      <Link href={`/opportunities/${lead.id}`} className="link-accent">
                        {lead.orgName}
                      </Link>
                    </td>
                    <td>{lead.agencyName}</td>
                    <td>{lead.headcount.toLocaleString()}</td>
                    <td>${lead.annualBudgetM.toFixed(0)}</td>
                    <td>{lead.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </LeadConsoleShell>
  );
}
