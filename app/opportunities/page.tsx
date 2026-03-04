import Link from "next/link";

import { RefreshButton } from "@/components/refresh-button";
import { activeProductProfile } from "@/config/productProfile";
import { prisma } from "@/lib/db";
import { parseNaics, parseScoreBreakdown } from "@/lib/parse";

type OpportunitiesPageProps = {
  searchParams: Promise<{
    agency?: string;
    dueWindow?: string;
    setAside?: string;
    naics?: string;
    wa?: string;
    view?: string;
  }>;
};

type ViewMode = "overview" | "leads" | "signals";

function mapRunStatusToClass(status: string): string {
  if (status === "completed") return "status status-success";
  if (status === "running") return "status status-running";
  if (status === "completed_with_errors") return "status status-warn";
  if (status === "failed") return "status status-error";
  return "status";
}

function extractNextAccessTime(errors: string[]): string | null {
  const joined = errors.join(" ");
  const match = joined.match(/nextAccessTime\":\"([^\"]+)\"/);
  return match?.[1] ?? null;
}

function dueDateFilter(windowDays: string | undefined) {
  if (!windowDays) return undefined;

  const days = Number(windowDays);
  if (!Number.isFinite(days) || days <= 0) return undefined;

  const now = new Date();
  const max = new Date(now);
  max.setDate(now.getDate() + days);

  return { gte: now, lte: max };
}

function pct(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

export default async function OpportunitiesPage({ searchParams }: OpportunitiesPageProps) {
  const params = await searchParams;

  const filterAgency = params.agency?.trim() ?? "";
  const filterSetAside = params.setAside?.trim() ?? "";
  const filterNaics = params.naics?.trim() ?? "";
  const waOnly = params.wa === "1";
  const hasActiveFilters = Boolean(filterAgency || params.dueWindow || filterSetAside || filterNaics || waOnly);

  const rawView = (params.view ?? "overview") as ViewMode;
  const view: ViewMode = ["overview", "leads", "signals"].includes(rawView) ? rawView : "overview";

  const dueWindow = dueDateFilter(params.dueWindow);

  const [latestRun, opportunities] = await Promise.all([
    prisma.refreshRun.findFirst({
      orderBy: { startedAt: "desc" }
    }),
    prisma.opportunity.findMany({
      where: {
        ...(filterAgency ? { agency: { contains: filterAgency } } : {}),
        ...(filterSetAside ? { setAside: { contains: filterSetAside } } : {}),
        ...(filterNaics ? { naics: { contains: filterNaics } } : {}),
        ...(dueWindow ? { dueDate: dueWindow } : {}),
        ...(waOnly ? { waRelevant: true } : {})
      },
      orderBy: [{ scoreTotal: "desc" }, { postedDate: "desc" }],
      take: 250
    })
  ]);

  let latestRunErrors: string[] = [];
  if (latestRun?.errors) {
    try {
      const parsed = JSON.parse(latestRun.errors);
      if (Array.isArray(parsed)) {
        latestRunErrors = parsed.filter((entry): entry is string => typeof entry === "string");
      }
    } catch {
      latestRunErrors = [];
    }
  }

  const latestRunNextAccessTime = extractNextAccessTime(latestRunErrors);

  const totalLeads = opportunities.length;
  const highPriority = opportunities.filter((opp) => opp.scoreTotal >= 70).length;
  const mediumPriority = opportunities.filter((opp) => opp.scoreTotal >= 45 && opp.scoreTotal < 70).length;
  const lowPriority = opportunities.filter((opp) => opp.scoreTotal < 45).length;
  const waLeads = opportunities.filter((opp) => opp.waRelevant).length;

  const now = new Date();
  const dueSoon = opportunities.filter((opp) => {
    if (!opp.dueDate) return false;
    const days = Math.floor((opp.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 7;
  }).length;

  const avgScore =
    totalLeads === 0 ? 0 : opportunities.reduce((sum, opp) => sum + opp.scoreTotal, 0) / totalLeads;

  const agencies = new Map<string, number>();
  for (const opp of opportunities) {
    agencies.set(opp.agency, (agencies.get(opp.agency) ?? 0) + 1);
  }
  const topAgencies = [...agencies.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([agency, count]) => ({ agency, count }));

  const stageCounts = {
    new: opportunities.filter((opp) => opp.status === "new").length,
    queued: opportunities.filter((opp) => opp.status === "queued").length,
    reviewed: opportunities.filter((opp) => opp.status === "reviewed").length,
    archived: opportunities.filter((opp) => opp.status === "archived").length
  };

  return (
    <div className="ops-shell">
      <aside className="ops-sidebar card">
        <h2 className="ops-sidebar-title">Ops Console</h2>
        <div className="ops-nav-group">
          <p className="meta">Workspace</p>
          <Link href="/opportunities?view=overview" className={view === "overview" ? "ops-nav active" : "ops-nav"}>
            Overview
          </Link>
          <Link href="/opportunities?view=leads" className={view === "leads" ? "ops-nav active" : "ops-nav"}>
            Lead Queue
          </Link>
          <Link href="/opportunities?view=signals" className={view === "signals" ? "ops-nav active" : "ops-nav"}>
            Signals
          </Link>
        </div>
        <div className="ops-nav-group">
          <p className="meta">Profile</p>
          <p className="ops-sidebar-text">{activeProductProfile.name}</p>
          <p className="meta">{activeProductProfile.description}</p>
        </div>
      </aside>

      <section className="ops-main stack">
        <header className="card stack">
          <div className="row row-between">
            <div className="stack">
              <h1>Federal Lead Intelligence Dashboard</h1>
              <p className="meta">Manual, explainable, GTM-ready opportunity triage for federal motions.</p>
            </div>
            <span className="badge">Manual refresh mode</span>
          </div>
          <RefreshButton />

          {latestRun ? (
            <div className="stack">
              <div className="row">
                <span className={mapRunStatusToClass(latestRun.status)}>{latestRun.status.replaceAll("_", " ")}</span>
                <span className="meta">
                  run {latestRun.id} | fetched {latestRun.countFetched} | upserted {latestRun.countUpserted} | enriched{" "}
                  {latestRun.countEnriched} | scored {latestRun.countScored} | briefed {latestRun.countBriefed}
                </span>
              </div>
              {latestRunErrors.length > 0 ? (
                <details className="callout callout-warn">
                  <summary>View run errors ({latestRunErrors.length})</summary>
                  <ul>
                    {latestRunErrors.slice(0, 5).map((entry) => (
                      <li key={entry}>{entry}</li>
                    ))}
                  </ul>
                  {latestRunNextAccessTime ? <p className="meta">SAM next access window: {latestRunNextAccessTime}</p> : null}
                </details>
              ) : null}
            </div>
          ) : (
            <p className="meta">No refresh runs recorded yet.</p>
          )}
        </header>

        <section className="ops-kpi-grid">
          <article className="card kpi-card">
            <p className="meta">Leads in scope</p>
            <h2>{totalLeads}</h2>
            <p className="meta">Ranked records in current filter context</p>
          </article>
          <article className="card kpi-card">
            <p className="meta">High priority</p>
            <h2>{highPriority}</h2>
            <p className="meta">Score threshold: 70+</p>
          </article>
          <article className="card kpi-card">
            <p className="meta">Due in 7 days</p>
            <h2>{dueSoon}</h2>
            <p className="meta">Active urgency queue</p>
          </article>
          <article className="card kpi-card">
            <p className="meta">Average score</p>
            <h2>{avgScore.toFixed(1)}</h2>
            <p className="meta">WA relevant: {waLeads}</p>
          </article>
        </section>

        <section className="ops-analysis-grid">
          <article className="card stack">
            <div className="row row-between">
              <h2>Score Band Distribution</h2>
              <span className="meta">Lead quality mix</span>
            </div>
            <div className="stack">
              <div className="bar-row">
                <span>High</span>
                <div className="bar-track">
                  <div className="bar-fill accent" style={{ width: `${pct(highPriority, totalLeads)}%` }} />
                </div>
                <span>{highPriority}</span>
              </div>
              <div className="bar-row">
                <span>Medium</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${pct(mediumPriority, totalLeads)}%` }} />
                </div>
                <span>{mediumPriority}</span>
              </div>
              <div className="bar-row">
                <span>Low</span>
                <div className="bar-track">
                  <div className="bar-fill muted" style={{ width: `${pct(lowPriority, totalLeads)}%` }} />
                </div>
                <span>{lowPriority}</span>
              </div>
            </div>
          </article>

          <article className="card stack">
            <div className="row row-between">
              <h2>Pipeline Stage Mix</h2>
              <span className="meta">Operational workflow health</span>
            </div>
            <div className="stack">
              <div className="bar-row">
                <span>New</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${pct(stageCounts.new, totalLeads)}%` }} />
                </div>
                <span>{stageCounts.new}</span>
              </div>
              <div className="bar-row">
                <span>Queued</span>
                <div className="bar-track">
                  <div className="bar-fill accent" style={{ width: `${pct(stageCounts.queued, totalLeads)}%` }} />
                </div>
                <span>{stageCounts.queued}</span>
              </div>
              <div className="bar-row">
                <span>Reviewed</span>
                <div className="bar-track">
                  <div className="bar-fill success" style={{ width: `${pct(stageCounts.reviewed, totalLeads)}%` }} />
                </div>
                <span>{stageCounts.reviewed}</span>
              </div>
              <div className="bar-row">
                <span>Archived</span>
                <div className="bar-track">
                  <div className="bar-fill muted" style={{ width: `${pct(stageCounts.archived, totalLeads)}%` }} />
                </div>
                <span>{stageCounts.archived}</span>
              </div>
            </div>
          </article>
        </section>

        <section className="ops-analysis-grid">
          <article className="card stack">
            <div className="row row-between">
              <h2>Top Agencies in Current Scope</h2>
              <span className="meta">Concentration signal</span>
            </div>
            {topAgencies.length === 0 ? (
              <p className="meta">No agency data available yet. Run refresh to populate.</p>
            ) : (
              <ul className="rank-list">
                {topAgencies.map((entry) => (
                  <li key={entry.agency} className="rank-row">
                    <span>{entry.agency}</span>
                    <span className="pill">{entry.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="card stack">
            <div className="row row-between">
              <h2>Lead Ops Filters</h2>
              {hasActiveFilters ? (
                <Link href={`/opportunities?view=${view}`} className="meta link-accent">
                  Clear filters
                </Link>
              ) : null}
            </div>
            <form className="row" method="GET">
              <input type="hidden" name="view" value={view} />
              <input name="agency" placeholder="Agency" defaultValue={filterAgency} />
              <select name="dueWindow" defaultValue={params.dueWindow ?? ""}>
                <option value="">Any due date</option>
                <option value="7">Due in 7 days</option>
                <option value="14">Due in 14 days</option>
                <option value="30">Due in 30 days</option>
              </select>
              <input name="setAside" placeholder="Set-aside" defaultValue={filterSetAside} />
              <input name="naics" placeholder="NAICS contains" defaultValue={filterNaics} />
              <label className="row row-tight">
                <input type="checkbox" name="wa" value="1" defaultChecked={waOnly} /> WA only
              </label>
              <button type="submit">Apply filters</button>
            </form>
          </article>
        </section>

        <section className="card stack">
          <div className="row row-between">
            <h2>Ranked Lead Queue</h2>
            <span className="meta">Showing {opportunities.length} rows</span>
          </div>
          <div className="flow-x">
            <table>
              <thead>
                <tr>
                  <th>Score</th>
                  <th>Lead</th>
                  <th>Agency</th>
                  <th>Due</th>
                  <th>Set-aside</th>
                  <th>NAICS</th>
                  <th>WA</th>
                  <th>Status</th>
                  <th>Explainability</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="callout callout-warn">
                        No lead records available. Refresh the pipeline to ingest new opportunities.
                      </div>
                    </td>
                  </tr>
                ) : (
                  opportunities.map((opp: (typeof opportunities)[number]) => {
                    const breakdown = parseScoreBreakdown(opp.scoreBreakdown);
                    const naics = parseNaics(opp.naics);
                    const reasons = breakdown.reasons.slice(0, 2).join("; ") || "N/A";

                    return (
                      <tr key={opp.id}>
                        <td>
                          <strong>{opp.scoreTotal.toFixed(1)}</strong>
                        </td>
                        <td>
                          <Link href={`/opportunities/${opp.id}`} className="link-accent">
                            {opp.title}
                          </Link>
                        </td>
                        <td>{opp.agency}</td>
                        <td>{opp.dueDate ? opp.dueDate.toISOString().slice(0, 10) : "N/A"}</td>
                        <td>{opp.setAside ?? "N/A"}</td>
                        <td>{naics.length > 0 ? naics.join(", ") : "N/A"}</td>
                        <td>{opp.waRelevant ? <span className="pill">WA</span> : "—"}</td>
                        <td>{opp.status}</td>
                        <td title={breakdown.reasons.join(" | ")}>{reasons}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  );
}
