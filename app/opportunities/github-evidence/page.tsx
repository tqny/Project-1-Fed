import { access, readdir } from "node:fs/promises";
import path from "node:path";

import { LeadConsoleShell } from "@/components/lead-console-shell";

type EvidenceItem = {
  label: string;
  filePath: string;
  exists: boolean;
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getEvidenceItems(): Promise<EvidenceItem[]> {
  const root = process.cwd();
  const checks = [
    { label: "README", rel: "README.md" },
    { label: "CHANGELOG", rel: "CHANGELOG.md" },
    { label: "ADR directory", rel: "docs/adr" },
    { label: "Demos directory", rel: "docs/demos" },
    { label: "Metrics directory", rel: "docs/metrics" },
    { label: "Postmortems directory", rel: "docs/postmortems" },
    { label: "Worklog directory", rel: "docs/worklog" },
    { label: "Evidence script", rel: "scripts/check-evidence.sh" },
    { label: "PR template", rel: ".github/PULL_REQUEST_TEMPLATE.md" },
    { label: "Evidence workflow", rel: ".github/workflows/evidence-check.yml" }
  ];

  const rows = await Promise.all(
    checks.map(async (entry) => {
      const filePath = path.join(root, entry.rel);
      return {
        label: entry.label,
        filePath: entry.rel,
        exists: await fileExists(filePath)
      };
    })
  );

  return rows;
}

async function latestWorklogFile(): Promise<string | null> {
  const worklogDir = path.join(process.cwd(), "docs", "worklog");
  try {
    const files = await readdir(worklogDir);
    const dated = files.filter((entry) => /^\d{4}-\d{2}-\d{2}\.md$/.test(entry)).sort().reverse();
    return dated[0] ?? null;
  } catch {
    return null;
  }
}

export default async function GithubEvidencePage() {
  const [items, latestWorklog] = await Promise.all([getEvidenceItems(), latestWorklogFile()]);
  const passed = items.filter((item) => item.exists).length;

  return (
    <LeadConsoleShell
      activePage="github-evidence"
      title="GitHub + Evidence"
      description="Repository governance and evidence discipline that supports portfolio-grade credibility."
      badge="Evidence-first"
    >
      <section className="ops-analysis-grid">
        <article className="card stack">
          <h2>Governance Snapshot</h2>
          <ul>
            <li>Main branch protected via PR-first workflow with required checks.</li>
            <li>Required checks target lint, build, and evidence verification.</li>
            <li>Daily work remains local until explicit end-of-day sync.</li>
          </ul>
          <div className="callout">
            Repository: <strong>tqny/Project-1-Fed</strong>
          </div>
        </article>

        <article className="card stack">
          <h2>Evidence Health</h2>
          <p className="meta">
            Core evidence items passing: {passed}/{items.length}
          </p>
          <p className="meta">Latest worklog file: {latestWorklog ?? "none found"}</p>
        </article>
      </section>

      <section className="card stack">
        <div className="row row-between">
          <h2>Evidence Checklist</h2>
          <span className="meta">File system verification</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Path</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.filePath}>
                <td>{item.label}</td>
                <td>{item.filePath}</td>
                <td>
                  <span className={item.exists ? "status status-success" : "status status-error"}>
                    {item.exists ? "present" : "missing"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </LeadConsoleShell>
  );
}
