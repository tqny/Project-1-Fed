import { LeadConsoleShell } from "@/components/lead-console-shell";

const stages = [
  {
    id: "01",
    title: "Lead Generation",
    description: "Generate synthetic realistic lead signals against public-reference agency/account seeds."
  },
  {
    id: "02",
    title: "Deterministic Scoring",
    description: "Apply weighted ICP scoring to compute grade, fit band, and explainable rationale."
  },
  {
    id: "03",
    title: "Sorting Agent",
    description: "Prioritize considerable leads, assign queue rank, and mark non-considerable as discarded."
  },
  {
    id: "04",
    title: "Operator Dashboard",
    description: "Render live queue, charts, filters, and handoff preview for review execution."
  },
  {
    id: "05",
    title: "Evidence Trail",
    description: "Capture worklog, checks, and governance signals for auditability and portfolio credibility."
  }
];

export default function ArchitecturePage() {
  return (
    <LeadConsoleShell
      activePage="architecture"
      title="System Architecture"
      description="Thin-slice architecture focused on deterministic decisions, clean data flow, and operational handoff."
      badge="v0.1 architecture"
    >
      <section className="card stack">
        <h2>Flow</h2>
        <div className="pipeline-stages">
          {stages.map((stage, index) => (
            <div className="pipeline-stage" key={stage.id}>
              <div className="pipeline-stage-head">
                <span className="badge">{stage.id}</span>
                <h3>{stage.title}</h3>
              </div>
              <p className="meta">{stage.description}</p>
              {index < stages.length - 1 ? <span className="pipeline-arrow">→</span> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="ops-analysis-grid">
        <article className="card stack">
          <h2>Core Modules</h2>
          <ul>
            <li>`lib/publicOrgSeeds.ts` for reference entities.</li>
            <li>`lib/lead-simulation.ts` for generation, scoring, and sorting.</li>
            <li>`app/api/leads/generate` and `app/api/leads/sort` for manual run triggers.</li>
            <li>`prisma/schema.prisma` (`Lead`, `LeadRun`) for persistence and run telemetry.</li>
          </ul>
        </article>

        <article className="card stack">
          <h2>Design Principles</h2>
          <ul>
            <li>Deterministic scoring is preferred over opaque ranking decisions.</li>
            <li>Structured reason outputs for explainability.</li>
            <li>Manual trigger first for controlled operations.</li>
            <li>Evidence-first governance from day one.</li>
          </ul>
        </article>
      </section>
    </LeadConsoleShell>
  );
}
