import Link from "next/link";
import { notFound } from "next/navigation";

import { activeProductProfile } from "@/config/productProfile";
import { prisma } from "@/lib/db";
import { parseBrief, parseNaics, parseScoreBreakdown } from "@/lib/parse";

type OpportunityDetailProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: Date | null): string {
  return value ? value.toISOString().slice(0, 10) : "N/A";
}

export default async function OpportunityDetailPage({ params }: OpportunityDetailProps) {
  const { id } = await params;

  const opp = await prisma.opportunity.findUnique({
    where: { id }
  });

  if (!opp) {
    notFound();
  }

  const naics = parseNaics(opp.naics);
  const breakdown = parseScoreBreakdown(opp.scoreBreakdown);
  const brief = parseBrief(opp.brief);

  return (
    <div className="stack">
      <Link href="/opportunities" className="link-accent">
        ← Back to pipeline
      </Link>

      <section className="card stack">
        <div className="row">
          <span className="badge">Active Product Profile</span>
          <strong>{activeProductProfile.name}</strong>
        </div>
        <p className="meta">{activeProductProfile.description}</p>
      </section>

      <section className="card stack">
        <h1>{opp.title}</h1>
        <p className="meta">{opp.agency}</p>
        <div className="row">
          <span className="badge">Score {opp.scoreTotal.toFixed(1)}</span>
          <span className="badge">Posted {formatDate(opp.postedDate)}</span>
          <span className="badge">Due {formatDate(opp.dueDate)}</span>
        </div>
        <p>
          <strong>Source:</strong>{" "}
          <a href={opp.url} target="_blank" rel="noreferrer" className="link-accent">
            {opp.url}
          </a>
        </p>
        <p>
          <strong>Set-aside:</strong> {opp.setAside ?? "N/A"}
        </p>
        <p>
          <strong>NAICS:</strong> {naics.length > 0 ? naics.join(", ") : "N/A"}
        </p>
        <p>
          <strong>Place of performance:</strong> {opp.placeOfPerformance ?? "N/A"}
        </p>
      </section>

      <section className="card stack">
        <h2>Score Breakdown</h2>
        <p className="meta">Deterministic, explainable model. No opaque AI ranker.</p>
        <div className="row">
          <span className="badge">Fit {breakdown.fit.toFixed(1)}</span>
          <span className="badge">Timing {breakdown.timing.toFixed(1)}</span>
          <span className="badge">Signal {breakdown.signal.toFixed(1)}</span>
          <span className="badge">Complexity {breakdown.complexity.toFixed(1)}</span>
        </div>

        <div className="stack">
          <div>
            <strong>Fit reasons</strong>
            <ul>
              {breakdown.details.fit.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Timing reasons</strong>
            <ul>
              {breakdown.details.timing.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Signal reasons</strong>
            <ul>
              {breakdown.details.signal.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Complexity reasons</strong>
            <ul>
              {breakdown.details.complexity.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="card stack">
        <h2>Opportunity Brief</h2>
        {brief ? (
          <>
            <p>{brief.summary}</p>
            <div>
              <strong>Why It Matters</strong>
              <ul>
                {brief.whyItMatters.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Suggested Outreach Angle</strong>
              <p>{brief.suggestedOutreachAngle}</p>
            </div>
            <div>
              <strong>Discovery Questions</strong>
              <ul>
                {brief.discoveryQuestions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Risks / Unknowns</strong>
              <ul>
                {brief.risksUnknowns.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Next Step</strong>
              <p>{brief.nextStep}</p>
            </div>
          </>
        ) : (
          <p className="meta">Brief unavailable.</p>
        )}
      </section>

      <section className="card stack">
        <h2>Raw Description</h2>
        <details>
          <summary>Show full solicitation description</summary>
          <pre className="preformatted">{opp.description ?? "No description available."}</pre>
        </details>
      </section>
    </div>
  );
}
