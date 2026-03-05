import { LeadConsoleShell } from "@/components/lead-console-shell";

export default function ProblemPage() {
  return (
    <LeadConsoleShell
      activePage="problem"
      title="Problem"
      description="Why this system exists and what operational gap it closes for a federal AI compliance GTM motion."
      badge="Portfolio context"
    >
      <section className="ops-analysis-grid">
        <article className="card stack">
          <h2>Operational Problem</h2>
          <p>
            Federal and defense opportunity targeting is often fragmented across static lists, manual judgment, and opaque
            ad-hoc prioritization. Teams lose time deciding what to work first.
          </p>
          <ul>
            <li>Signal overload: too many potential accounts with uneven context.</li>
            <li>No shared ranking policy: decisions vary by operator.</li>
            <li>Weak audit trail: difficult to explain why a lead was prioritized or dropped.</li>
          </ul>
        </article>

        <article className="card stack">
          <h2>Who This Is For</h2>
          <ul>
            <li>Customer Success and Account teams managing strategic federal pipelines.</li>
            <li>Business Development and AM teams qualifying enterprise account potential.</li>
            <li>Revenue leaders who need explainable, repeatable prioritization logic.</li>
          </ul>
          <div className="callout">
            Goal: translate scattered lead signals into a ranked queue with clear reason codes and handoff-ready outputs.
          </div>
        </article>
      </section>

      <section className="ops-analysis-grid">
        <article className="card stack">
          <h2>What “Good” Looks Like</h2>
          <ul>
            <li>A compact queue of considerable accounts (A-C) for operator action.</li>
            <li>Transparent score breakdown per lead, not black-box ranking.</li>
            <li>Clear separation between realistic synthetic demo signals and public-reference identity data.</li>
            <li>Evidence-first workflow that documents decisions and validations.</li>
          </ul>
        </article>

        <article className="card stack">
          <h2>v0.1 Scope Boundary</h2>
          <ul>
            <li>In scope: generation, deterministic scoring, sorting, dashboard, evidence hygiene.</li>
            <li>Deferred: scheduled automation, exports, additional macro-data enrichments, auth.</li>
          </ul>
          <p className="meta">Scope discipline is deliberate to keep the MVP credible and shippable.</p>
        </article>
      </section>
    </LeadConsoleShell>
  );
}
