import { z } from "zod";

import type { BriefInput, OpportunityBrief } from "@/packages/core/types";

const briefSchema = z.object({
  summary: z.string(),
  whyItMatters: z.array(z.string()).min(1),
  suggestedOutreachAngle: z.string(),
  discoveryQuestions: z.array(z.string()).min(3),
  risksUnknowns: z.array(z.string()).min(1),
  nextStep: z.string()
});

type LLMClient = {
  generateStructuredBrief(input: BriefInput): Promise<OpportunityBrief>;
};

function buildPrompt(input: BriefInput): string {
  return [
    "You are drafting a federal opportunity brief for an AI compliance and workflow automation SaaS GTM team.",
    "Use only provided facts. If uncertain, explicitly say unknown/TBD.",
    "Do not invent spend amounts, contract values, agencies, dates, or requirements.",
    "Output must be valid JSON matching the required schema.",
    "",
    `Product profile: ${input.productProfile.name}`,
    `Profile description: ${input.productProfile.description}`,
    `Opportunity title: ${input.opportunity.title}`,
    `Agency: ${input.opportunity.agency}`,
    `Posted date: ${input.opportunity.postedDate.toISOString()}`,
    `Due date: ${input.opportunity.dueDate?.toISOString() ?? "unknown"}`,
    `NAICS: ${input.opportunity.naics.join(", ") || "unknown"}`,
    `Set-aside: ${input.opportunity.setAside ?? "unknown"}`,
    `Place of performance: ${input.opportunity.placeOfPerformance ?? "unknown"}`,
    `Description: ${input.opportunity.description ?? "No description available."}`,
    `Score total: ${input.scoreBreakdown.weightedTotal}`,
    `Score reasons: ${input.scoreBreakdown.reasons.join(" | ")}`,
    `Enrichment JSON: ${JSON.stringify(input.opportunity.enrichment ?? {})}`
  ].join("\n");
}

function stubBrief(reason = "LLM not configured; TBD"): OpportunityBrief {
  return {
    summary: reason,
    whyItMatters: ["Opportunity requires manual review before outreach prioritization."],
    suggestedOutreachAngle:
      "Lead with governance, security, and audit-readiness alignment; validate requirements before committing scope.",
    discoveryQuestions: [
      "What compliance framework requirements are explicitly in scope?",
      "What existing workflow tooling must integrate with the delivered solution?",
      "Who is the technical and business decision owner for this procurement?"
    ],
    risksUnknowns: ["LLM-generated brief unavailable or incomplete."],
    nextStep: "Review the solicitation text directly and refine outreach assumptions."
  };
}

class StubLLMClient implements LLMClient {
  async generateStructuredBrief(): Promise<OpportunityBrief> {
    return stubBrief();
  }
}

class OpenAIResponsesClient implements LLMClient {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateStructuredBrief(input: BriefInput): Promise<OpportunityBrief> {
    const prompt = buildPrompt(input);

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.2,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: "Return only JSON matching the schema. Keep statements factual and concise."
              }
            ]
          },
          {
            role: "user",
            content: [{ type: "input_text", text: prompt }]
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "opportunity_brief",
            strict: true,
            schema: {
              type: "object",
              properties: {
                summary: { type: "string" },
                whyItMatters: { type: "array", items: { type: "string" } },
                suggestedOutreachAngle: { type: "string" },
                discoveryQuestions: { type: "array", items: { type: "string" } },
                risksUnknowns: { type: "array", items: { type: "string" } },
                nextStep: { type: "string" }
              },
              required: [
                "summary",
                "whyItMatters",
                "suggestedOutreachAngle",
                "discoveryQuestions",
                "risksUnknowns",
                "nextStep"
              ],
              additionalProperties: false
            }
          }
        }
      })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI request failed (${response.status}): ${body}`);
    }

    const payload = (await response.json()) as {
      output_text?: string;
      output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    };

    const raw =
      payload.output_text ??
      payload.output?.flatMap((part) => part.content ?? []).find((content) => content.type?.includes("text"))
        ?.text;

    if (!raw) {
      throw new Error("OpenAI response did not include JSON text output");
    }

    return briefSchema.parse(JSON.parse(raw));
  }
}

function createLLMClient(): LLMClient {
  const provider = (process.env.LLM_PROVIDER ?? "stub").toLowerCase();

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new StubLLMClient();
    }

    return new OpenAIResponsesClient(apiKey, process.env.OPENAI_MODEL ?? "gpt-4.1-mini");
  }

  return new StubLLMClient();
}

export async function generateOpportunityBrief(input: BriefInput): Promise<OpportunityBrief> {
  const client = createLLMClient();

  try {
    return await client.generateStructuredBrief(input);
  } catch (error) {
    console.error("Brief generation failed", error);
    return stubBrief("LLM unavailable or generation failed; TBD");
  }
}
