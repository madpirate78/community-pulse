import { ThinkingLevel } from "@google/genai";
import { NextResponse } from "next/server";
import { getAI, MODELS } from "@/lib/gemini";
import { db } from "@/db";
import { insightSnapshots } from "@/db/schema";
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
  const start = Date.now();

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
      return NextResponse.json(
        { error: "No submissions to analyse" },
        { status: 400 }
      );
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

    const response = await getAI().models.generateContent({
      model: MODELS.pro,
      contents: [
        { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] },
      ],
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        tools: [{ googleSearch: {} }],
      },
    });

    const insightText = response.text ?? "";
    const elapsed = Date.now() - start;

    await db.insert(insightSnapshots).values({
      insightText,
      dataSummary: summary as unknown as Record<string, unknown>,
      submissionCount: summary.total_responses,
      modelUsed: MODELS.pro,
      generationTimeMs: elapsed,
    });

    return NextResponse.json({
      insightText,
      submissionCount: summary.total_responses,
      generationTimeMs: elapsed,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
}
