import { z } from "zod";

// ─── Fixed Questions (everyone answers these) ─────────────────

export const PRESSURE_OPTIONS = [
  "housing",
  "food",
  "energy",
  "transport",
  "childcare",
  "healthcare",
  "debt",
  "other",
] as const;

export type PressureOption = (typeof PRESSURE_OPTIONS)[number];

export const fixedQuestionsSchema = z.object({
  biggest_pressure: z.enum(PRESSURE_OPTIONS),
  change_direction: z.coerce.number().min(1).max(5),
  sacrifice: z
    .string()
    .min(2, "Please share at least a brief answer")
    .max(200, "Please keep this brief — under 200 characters"),
});

export type FixedAnswers = z.infer<typeof fixedQuestionsSchema>;

// ─── Adaptive Questions (AI-generated follow-ups) ─────────────

export const adaptiveQuestionSchema = z.object({
  questions: z
    .array(
      z.object({
        question_text: z.string(),
        input_type: z.enum(["single_choice", "scale", "short_text"]),
        options: z.array(z.string()).optional(),
        scale_min_label: z.string().optional(),
        scale_max_label: z.string().optional(),
        reasoning: z.string(),
      })
    )
    .min(1)
    .max(2),
});

export type AdaptiveQuestions = z.infer<typeof adaptiveQuestionSchema>;

// ─── Dataset Summary (fed into AI prompts) ────────────────────

export interface DatasetSummary {
  total_responses: number;
  top_pressure: string;
  top_pressure_pct: number;
  avg_change: number;
  sacrifice_themes: string[];
  emerging_gap: string | null;
}

// ─── UI Labels ────────────────────────────────────────────────

export const PRESSURE_LABELS: Record<string, string> = {
  housing: "\u{1F3E0} Housing costs",
  food: "\u{1F6D2} Food & groceries",
  energy: "\u26A1 Energy bills",
  transport: "\u{1F697} Getting around",
  childcare: "\u{1F476} Childcare",
  healthcare: "\u{1F3E5} Healthcare",
  debt: "\u{1F4B3} Debt & borrowing",
  other: "Other",
};

export const CHANGE_LABELS: Record<number, string> = {
  1: "Much better",
  2: "A bit better",
  3: "Same",
  4: "Worse",
  5: "Much worse",
};
