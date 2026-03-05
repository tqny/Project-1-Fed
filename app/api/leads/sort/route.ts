import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { sortSyntheticLeads } from "@/lib/lead-simulation";

export async function POST() {
  const run = await prisma.leadRun.create({
    data: {
      runType: "sort",
      status: "running"
    }
  });

  try {
    const leads = await prisma.lead.findMany({
      select: {
        id: true,
        orgName: true,
        icpGrade: true,
        icpScore: true,
        relatedSpendM: true,
        procurementReadiness: true,
        considerable: true
      }
    });

    const sorted = sortSyntheticLeads(leads);

    await prisma.$transaction(
      sorted.updates.map((entry) =>
        prisma.lead.update({
          where: { id: entry.id },
          data: {
            priorityRank: entry.priorityRank,
            status: entry.status
          }
        })
      )
    );

    await prisma.leadRun.update({
      where: { id: run.id },
      data: {
        status: "completed",
        sortedCount: sorted.summary.sortedCount,
        summary: JSON.stringify(sorted.summary),
        finishedAt: new Date()
      }
    });

    return NextResponse.json({
      runId: run.id,
      ...sorted.summary
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown lead sort error";

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
