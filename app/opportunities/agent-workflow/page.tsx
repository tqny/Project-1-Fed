import { LeadConsoleShell } from "@/components/lead-console-shell";
import { prisma } from "@/lib/db";

function mapStatusToClass(status: string): string {
  if (status === "completed") return "status status-success";
  if (status === "running") return "status status-running";
  if (status === "failed") return "status status-error";
  return "status";
}

function formatDateTime(value: Date): string {
  return value.toISOString().replace("T", " ").slice(0, 16) + "Z";
}

function safeParseErrors(input: string): string[] {
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

export default async function AgentWorkflowPage() {
  const [runs, leadCounts] = await Promise.all([
    prisma.leadRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 10
    }),
    prisma.lead.groupBy({
      by: ["status"],
      _count: { status: true }
    })
  ]);

  const countMap = new Map<string, number>();
  for (const row of leadCounts) {
    countMap.set(row.status, row._count.status);
  }

  const generatedCount = countMap.get("generated") ?? 0;
  const queuedCount = countMap.get("queued") ?? 0;
  const discardedCount = countMap.get("discarded") ?? 0;

  return (
    <LeadConsoleShell
      activePage="agent-workflow"
      title="Agent Workflow"
      description="Transparent operator-in-the-loop flow from generation through handoff and queue review."
      badge="Execution trail"
    >
      <section className="ops-analysis-grid">
        <article className="card stack">
          <h2>Current Queue State</h2>
          <div className="bar-row">
            <span>Generated</span>
            <div className="bar-track">
              <div
                className="bar-fill accent"
                style={{ width: `${generatedCount + queuedCount + discardedCount === 0 ? 0 : (generatedCount / (generatedCount + queuedCount + discardedCount)) * 100}%` }}
              />
            </div>
            <span>{generatedCount}</span>
          </div>
          <div className="bar-row">
            <span>Queued</span>
            <div className="bar-track">
              <div
                className="bar-fill success"
                style={{ width: `${generatedCount + queuedCount + discardedCount === 0 ? 0 : (queuedCount / (generatedCount + queuedCount + discardedCount)) * 100}%` }}
              />
            </div>
            <span>{queuedCount}</span>
          </div>
          <div className="bar-row">
            <span>Discarded</span>
            <div className="bar-track">
              <div
                className="bar-fill muted"
                style={{ width: `${generatedCount + queuedCount + discardedCount === 0 ? 0 : (discardedCount / (generatedCount + queuedCount + discardedCount)) * 100}%` }}
              />
            </div>
            <span>{discardedCount}</span>
          </div>
        </article>

        <article className="card stack">
          <h2>Operator Runbook</h2>
          <ol className="workflow-list">
            <li>Set batch size and run lead generation.</li>
            <li>Review grade distribution and concentration charts.</li>
            <li>Run sorting agent to produce ranked queue handoff.</li>
            <li>Inspect top-ranked lead details and rationale trail.</li>
            <li>Capture outcomes in worklog and proceed with evidence-first closeout.</li>
          </ol>
        </article>
      </section>

      <section className="card stack">
        <div className="row row-between">
          <h2>Recent Agent Runs</h2>
          <span className="meta">Most recent 10 runs</span>
        </div>
        <div className="flow-x">
          <table>
            <thead>
              <tr>
                <th>Run Type</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Generated</th>
                <th>Sorted</th>
                <th>Started</th>
                <th>Finished</th>
                <th>Errors</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <p className="meta">No runs yet.</p>
                  </td>
                </tr>
              ) : (
                runs.map((run) => {
                  const errors = safeParseErrors(run.errors);
                  return (
                    <tr key={run.id}>
                      <td>{run.runType}</td>
                      <td>
                        <span className={mapStatusToClass(run.status)}>{run.status}</span>
                      </td>
                      <td>{run.requestedCount ?? "—"}</td>
                      <td>{run.generatedCount}</td>
                      <td>{run.sortedCount}</td>
                      <td>{formatDateTime(run.startedAt)}</td>
                      <td>{run.finishedAt ? formatDateTime(run.finishedAt) : "—"}</td>
                      <td>{errors.length}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </LeadConsoleShell>
  );
}
