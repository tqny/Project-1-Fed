import { NextResponse } from "next/server";

import { runRefreshPipeline } from "@/lib/refresh";

export async function POST() {
  const summary = await runRefreshPipeline(150);

  const ok = summary.errors.length === 0 || summary.countUpserted > 0;
  return NextResponse.json(summary, { status: ok ? 200 : 500 });
}
