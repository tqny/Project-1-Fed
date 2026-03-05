"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type GenerateResponse = {
  runId: string;
  total: number;
  gradeCounts: Record<string, number>;
  fitBandCounts: Record<string, number>;
  considerableCount: number;
  disclosure: string;
  error?: string;
};

type SortResponse = {
  runId: string;
  sortedCount: number;
  queuedCount: number;
  discardedCount: number;
  topHandoff: Array<{ orgName: string; icpGrade: string; icpScore: number; priorityRank: number }>;
  error?: string;
};

export function LeadOpsControls() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [batchSize, setBatchSize] = useState(80);
  const [generateResult, setGenerateResult] = useState<GenerateResponse | null>(null);
  const [sortResult, setSortResult] = useState<SortResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const gradeSummary = useMemo(() => {
    if (!generateResult) return "";
    const counts = generateResult.gradeCounts;
    return `A:${counts.A ?? 0}  B:${counts.B ?? 0}  C:${counts.C ?? 0}  D:${counts.D ?? 0}  F:${counts.F ?? 0}`;
  }, [generateResult]);

  const runGenerate = () => {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/leads/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ count: batchSize })
        });

        const payload = (await response.json()) as GenerateResponse;
        if (!response.ok || payload.error) {
          throw new Error(payload.error || "Lead generation failed");
        }

        setGenerateResult(payload);
        setSortResult(null);
        router.refresh();
      } catch (generationError) {
        setError(generationError instanceof Error ? generationError.message : "Unknown generation error");
      }
    });
  };

  const runSort = () => {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/leads/sort", {
          method: "POST"
        });

        const payload = (await response.json()) as SortResponse;
        if (!response.ok || payload.error) {
          throw new Error(payload.error || "Lead sorting failed");
        }

        setSortResult(payload);
        router.refresh();
      } catch (sortingError) {
        setError(sortingError instanceof Error ? sortingError.message : "Unknown sorting error");
      }
    });
  };

  return (
    <div className="stack">
      <div className="row">
        <label className="meta" htmlFor="batch-size">
          Lead batch size
        </label>
        <select
          id="batch-size"
          value={String(batchSize)}
          onChange={(event) => setBatchSize(Number(event.target.value))}
          disabled={isPending}
        >
          <option value="40">40</option>
          <option value="60">60</option>
          <option value="80">80</option>
          <option value="100">100</option>
        </select>
        <button type="button" onClick={runGenerate} disabled={isPending}>
          {isPending ? "Working..." : "Generate Leads"}
        </button>
        <button type="button" onClick={runSort} disabled={isPending}>
          {isPending ? "Working..." : "Run Sorting Agent"}
        </button>
      </div>

      {generateResult ? (
        <details className="callout">
          <summary>Generation summary (run {generateResult.runId})</summary>
          <p className="meta">Total generated: {generateResult.total}</p>
          <p className="meta">Grade mix: {gradeSummary}</p>
          <p className="meta">Considerable leads: {generateResult.considerableCount}</p>
          <p className="meta">{generateResult.disclosure}</p>
        </details>
      ) : null}

      {sortResult ? (
        <details className="callout">
          <summary>Sorting handoff (run {sortResult.runId})</summary>
          <p className="meta">
            Sorted: {sortResult.sortedCount} | Queued: {sortResult.queuedCount} | Discarded: {sortResult.discardedCount}
          </p>
          <ul>
            {sortResult.topHandoff.slice(0, 5).map((entry) => (
              <li key={`${entry.priorityRank}-${entry.orgName}`}>
                #{entry.priorityRank} {entry.orgName} ({entry.icpGrade}, {entry.icpScore})
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {error ? <p className="meta">Agent error: {error}</p> : null}
    </div>
  );
}
