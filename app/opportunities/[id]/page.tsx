import Link from "next/link";
import { notFound } from "next/navigation";

import { enterpriseICPProfile } from "@/config/icpProfile";
import { prisma } from "@/lib/db";
import { parseLeadRationale, parseStringMap } from "@/lib/parse";

type LeadDetailProps = {
  params: Promise<{ id: string }>;
};

function formatDateTime(value: Date): string {
  return value.toISOString().replace("T", " ").slice(0, 16) + "Z";
}

function mapGradeToClass(grade: string): string {
  if (grade === "A") return "status status-success";
  if (grade === "B" || grade === "C") return "status status-running";
  if (grade === "D") return "status status-warn";
  return "status status-error";
}

export default async function LeadDetailPage({ params }: LeadDetailProps) {
  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id }
  });

  if (!lead) {
    notFound();
  }

  const rationale = parseLeadRationale(lead.rationale);
  const provenance = parseStringMap(lead.fieldProvenance);

  return (
    <div className="stack">
      <Link href="/opportunities" className="link-accent">
        ← Back to lead intelligence dashboard
      </Link>

      <section className="card stack">
        <div className="row">
          <span className="badge">Active ICP Profile</span>
          <strong>{enterpriseICPProfile.profileName}</strong>
        </div>
        <p className="meta">{enterpriseICPProfile.pretendOffering}</p>
      </section>

      <section className="card stack">
        <h1>{lead.orgName}</h1>
        <p className="meta">
          {lead.agencyName} • {lead.segment}
        </p>
        <div className="row">
          <span className={mapGradeToClass(lead.icpGrade)}>Grade {lead.icpGrade}</span>
          <span className="badge">ICP Score {lead.icpScore.toFixed(1)}</span>
          <span className="badge">{lead.fitBand}</span>
          <span className="badge">{lead.considerable ? "Considerable" : "Outside consider range"}</span>
        </div>
        <p className="meta">Generated: {formatDateTime(lead.generatedAt)}</p>
        <p>
          <strong>Website:</strong>{" "}
          {lead.website ? (
            <a href={lead.website} target="_blank" rel="noreferrer" className="link-accent">
              {lead.website}
            </a>
          ) : (
            "N/A"
          )}
        </p>
        <p>
          <strong>Phone:</strong> {lead.phone ?? "N/A"}
        </p>
        <p>
          <strong>Headcount proxy:</strong> {lead.headcount.toLocaleString()}
        </p>
        <p>
          <strong>Simulated annual budget:</strong> ${lead.annualBudgetM.toFixed(1)}M
        </p>
        <p>
          <strong>Simulated related spend:</strong> ${lead.relatedSpendM.toFixed(1)}M
        </p>
        <p>
          <strong>Governance role signal:</strong> {lead.governanceRolePresent ? lead.governanceRoleTitle : "Not present"}
        </p>
      </section>

      <section className="card stack">
        <h2>Deterministic ICP Scoring Rationale</h2>
        <p className="meta">Explicit weighted scoring, designed for auditability and repeatability.</p>
        <div className="row">
          <span className="badge">Procurement readiness {lead.procurementReadiness}</span>
          <span className="badge">Compliance urgency {lead.complianceUrgency}</span>
          <span className="badge">Regulatory complexity {lead.regulatoryComplexity}</span>
          <span className="badge">Cyber pressure {lead.cyberPressure}</span>
        </div>

        <div className="ops-analysis-grid">
          <article className="callout stack">
            <h3>Component Scores</h3>
            <p className="meta">Scale & budget: {rationale?.componentScores.scaleAndBudget ?? "N/A"}</p>
            <p className="meta">Spend propensity: {rationale?.componentScores.spendPropensity ?? "N/A"}</p>
            <p className="meta">
              Organizational readiness: {rationale?.componentScores.organizationalReadiness ?? "N/A"}
            </p>
            <p className="meta">Urgency pressure: {rationale?.componentScores.urgencyPressure ?? "N/A"}</p>
          </article>
          <article className="callout stack">
            <h3>Decision Trail</h3>
            {rationale?.reasons?.length ? (
              <ul>
                {rationale.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p className="meta">No rationale available.</p>
            )}
          </article>
        </div>
      </section>

      <section className="card stack">
        <h2>Agent Handoff Status</h2>
        <div className="row">
          <span className="badge">Status: {lead.status}</span>
          <span className="badge">Priority rank: {lead.priorityRank ?? "unranked"}</span>
        </div>
        <p className="meta">
          `Run Sorting Agent` writes queue/priority for all considerable leads. Non-considerable leads are marked
          discarded.
        </p>
      </section>

      <section className="card stack">
        <h2>Field Provenance</h2>
        <details>
          <summary>Show source provenance for each field</summary>
          {provenance ? (
            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Provenance</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(provenance).map(([field, source]) => (
                  <tr key={field}>
                    <td>{field}</td>
                    <td>{source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="meta">No provenance metadata available.</p>
          )}
        </details>
        <p className="meta">{enterpriseICPProfile.syntheticDisclosure}</p>
      </section>
    </div>
  );
}
