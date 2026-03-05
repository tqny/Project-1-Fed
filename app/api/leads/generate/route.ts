import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { generateSyntheticLeads } from "@/lib/lead-simulation";

export async function POST(request: Request) {
  const run = await prisma.leadRun.create({
    data: {
      runType: "generate",
      status: "running"
    }
  });

  try {
    const payload = (await request.json().catch(() => ({}))) as {
      count?: number;
      mix?: {
        A?: number;
        B?: number;
        C?: number;
        D?: number;
      };
    };

    const count = typeof payload.count === "number" ? payload.count : 80;
    const result = generateSyntheticLeads(count, payload.mix);

    await prisma.lead.deleteMany();

    await prisma.lead.createMany({
      data: result.leads
    });

    await prisma.leadRun.update({
      where: { id: run.id },
      data: {
        status: "completed",
        requestedCount: count,
        generatedCount: result.summary.total,
        summary: JSON.stringify(result.summary),
        finishedAt: new Date()
      }
    });

    return NextResponse.json({
      runId: run.id,
      ...result.summary
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown lead generation error";

    await prisma.leadRun.update({
      where: { id: run.id },
      data: {
        status: "failed",
        errors: JSON.stringify([errorMessage]),
        finishedAt: new Date()
      }
    });

    return NextResponse.json(
      {
        runId: run.id,
        error: errorMessage
      },
      { status: 500 }
    );
  }
}
