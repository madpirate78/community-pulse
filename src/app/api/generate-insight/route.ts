import { ThinkingLevel } from "@google/genai";
import { getAI, MODELS } from "@/lib/gemini";
import { buildInsightSystemPrompt, buildInsightUserPrompt } from "@/lib/prompts";
import {
  getDatasetSummary,
  getAllSacrifices,
  getAllAdaptiveData,
  getPressureCounts,
  getRecentSubmissionCounts,
} from "@/lib/db-queries";
import { PRESSURE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const [summary, sacrifices, adaptiveData, pressureCounts, recent] =
      await Promise.all([
        getDatasetSummary(),
        getAllSacrifices(),
        getAllAdaptiveData(),
        getPressureCounts(),
        getRecentSubmissionCounts(),
      ]);

    if (summary.total_responses === 0) {
      return new Response("No submissions yet.", { status: 200 });
    }

    const pressuresRanked = Object.entries(pressureCounts)
      .sort(([, a], [, b]) => b - a)
      .filter(([, count]) => count > 0)
      .map(
        ([key, count]) =>
          `${PRESSURE_LABELS[key] ?? key}: ${count} (${Math.round((count / summary.total_responses) * 100)}%)`
      )
      .join("\n");

    const systemPrompt = buildInsightSystemPrompt();
    const userPrompt = buildInsightUserPrompt(
      summary,
      pressuresRanked,
      sacrifices,
      adaptiveData,
      recent.thisWeek,
      recent.thisMonth
    );

    const response = await getAI().models.generateContentStream({
      model: MODELS.flash,
      contents: [
        { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] },
      ],
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Insight generation error:", error);
    return new Response("Failed to generate insight", { status: 500 });
  }
}
