"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type RefreshResponse = {
  runId?: string;
  countFetched: number;
  countUpserted: number;
  countEnriched: number;
  countScored: number;
  countBriefed: number;
  errors: string[];
};

function extractNextAccessTime(messages: string[]): string | null {
  const joined = messages.join(" ");
  const match = joined.match(/nextAccessTime\":\"([^\"]+)\"/);
  return match?.[1] ?? null;
}

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<RefreshResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onRefresh = () => {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/refresh", { method: "POST" });
        const payload = (await response.json()) as RefreshResponse;
        setResult(payload);

        if (!response.ok) {
          setError(payload.errors?.join("; ") || "Refresh failed");
          router.refresh();
          return;
        }

        setError(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown refresh error");
      }
    });
  };

  const nextAccessTime = result ? extractNextAccessTime(result.errors) : null;

  return (
    <div className="stack">
      <button type="button" onClick={onRefresh} disabled={isPending}>
        {isPending ? "Refreshing..." : "Refresh Opportunities"}
      </button>
      {result ? (
        <div className="stack">
          <p className="meta">
            {result.runId ? `run ${result.runId} | ` : ""}
            fetched {result.countFetched} | upserted {result.countUpserted} | enriched {result.countEnriched} | scored{" "}
            {result.countScored} | briefed {result.countBriefed}
            {result.errors.length > 0 ? ` | errors ${result.errors.length}` : ""}
          </p>
          {result.errors.length > 0 ? (
            <details className="callout callout-warn">
              <summary>View refresh errors</summary>
              <ul>
                {result.errors.slice(0, 5).map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
              {nextAccessTime ? <p className="meta">SAM next access window: {nextAccessTime}</p> : null}
            </details>
          ) : null}
        </div>
      ) : null}
      {error ? <p className="meta">Refresh error: {error}</p> : null}
    </div>
  );
}
