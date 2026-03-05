import { LeadConsoleShell } from "@/components/lead-console-shell";
import { enterpriseICPProfile } from "@/config/icpProfile";

export default function PolicyPage() {
  const ideal = enterpriseICPProfile.enterpriseCriteria.ideal;
  const acceptable = enterpriseICPProfile.enterpriseCriteria.acceptable;
  const weights = enterpriseICPProfile.gradingWeights;

  return (
    <LeadConsoleShell
      activePage="policy"
      title="Policy & Guardrails"
      description="Deterministic qualification policy that defines what is ideal, acceptable, or out of consideration."
      badge="Scoring policy"
    >
      <section className="ops-analysis-grid">
        <article className="card stack">
          <h2>Enterprise Guardrails</h2>
          <table>
            <thead>
              <tr>
                <th>Band</th>
                <th>Headcount</th>
                <th>Annual Budget (M)</th>
                <th>Related Spend (M)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ideal</td>
                <td>{ideal.minHeadcount.toLocaleString()}+</td>
                <td>${ideal.minAnnualBudgetM.toLocaleString()}+</td>
                <td>${ideal.minRelatedSpendM.toLocaleString()}+</td>
              </tr>
              <tr>
                <td>Acceptable</td>
                <td>{acceptable.minHeadcount.toLocaleString()}+</td>
                <td>${acceptable.minAnnualBudgetM.toLocaleString()}+</td>
                <td>${acceptable.minRelatedSpendM.toLocaleString()}+</td>
              </tr>
            </tbody>
          </table>
          <p className="meta">A-C are considered actionable. D-F are visible for triage but excluded from queue handoff.</p>
        </article>

        <article className="card stack">
          <h2>Grade Policy</h2>
          <table>
            <thead>
              <tr>
                <th>Grade</th>
                <th>Score Band</th>
                <th>Fit Band</th>
                <th>Considerable</th>
              </tr>
            </thead>
            <tbody>
              {enterpriseICPProfile.gradeBands.map((band) => (
                <tr key={band.label}>
                  <td>{band.label}</td>
                  <td>
                    {band.minScore}-{band.maxScore}
                  </td>
                  <td>{band.fitBand}</td>
                  <td>{band.considerable ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>

      <section className="ops-analysis-grid">
        <article className="card stack">
          <h2>Weighting Model</h2>
          <div className="stack">
            <div className="bar-row">
              <span>Scale/Budget</span>
              <div className="bar-track">
                <div className="bar-fill accent" style={{ width: `${weights.scaleAndBudget * 100}%` }} />
              </div>
              <span>{Math.round(weights.scaleAndBudget * 100)}%</span>
            </div>
            <div className="bar-row">
              <span>Spend</span>
              <div className="bar-track">
                <div className="bar-fill success" style={{ width: `${weights.spendPropensity * 100}%` }} />
              </div>
              <span>{Math.round(weights.spendPropensity * 100)}%</span>
            </div>
            <div className="bar-row">
              <span>Readiness</span>
              <div className="bar-track">
                <div className="bar-fill accent" style={{ width: `${weights.organizationalReadiness * 100}%` }} />
              </div>
              <span>{Math.round(weights.organizationalReadiness * 100)}%</span>
            </div>
            <div className="bar-row">
              <span>Urgency</span>
              <div className="bar-track">
                <div className="bar-fill muted" style={{ width: `${weights.urgencyPressure * 100}%` }} />
              </div>
              <span>{Math.round(weights.urgencyPressure * 100)}%</span>
            </div>
          </div>
        </article>

        <article className="card stack">
          <h2>Disclosure</h2>
          <p>{enterpriseICPProfile.syntheticDisclosure}</p>
          <div className="callout">
            <strong>Public-reference fields:</strong> organization name, agency, website, phone, headcount proxy.
          </div>
          <div className="callout">
            <strong>Synthetic fields:</strong> budget, related spend, role-readiness, urgency pressure signals.
          </div>
        </article>
      </section>
    </LeadConsoleShell>
  );
}
