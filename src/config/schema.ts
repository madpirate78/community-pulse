import { z } from "zod";

// ─── Question definitions (discriminated union) ─────────────

const choiceOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

const choiceQuestionSchema = z.object({
  type: z.literal("choice"),
  fieldName: z.string(),
  label: z.string(),
  options: z.array(choiceOptionSchema).min(2),
});

const scaleQuestionSchema = z.object({
  type: z.literal("scale"),
  fieldName: z.string(),
  label: z.string(),
  min: z.number().int(),
  max: z.number().int(),
  labels: z.record(z.coerce.string(), z.string()),
});

const textQuestionSchema = z.object({
  type: z.literal("text"),
  fieldName: z.string(),
  label: z.string(),
  placeholder: z.string(),
  minLength: z.number().int().min(0),
  maxLength: z.number().int().min(1),
});

export const fixedQuestionSchema = z.discriminatedUnion("type", [
  choiceQuestionSchema,
  scaleQuestionSchema,
  textQuestionSchema,
]);

export type FixedQuestion = z.infer<typeof fixedQuestionSchema>;
export type ChoiceQuestion = z.infer<typeof choiceQuestionSchema>;
export type ScaleQuestion = z.infer<typeof scaleQuestionSchema>;
export type TextQuestion = z.infer<typeof textQuestionSchema>;

// ─── Seed data entry ────────────────────────────────────────

const seedEntrySchema = z.object({
  responses: z.record(z.string(), z.unknown()),
  adaptiveData: z.array(z.record(z.string(), z.unknown())).optional(),
});

// ─── Top-level config schema ────────────────────────────────

export const surveyConfigSchema = z.object({
  branding: z.object({
    appName: z.string(),
    tagline: z.string(),
    metaDescription: z.string(),
    ogDescription: z.string(),
  }),

  pages: z.object({
    hero: z.object({
      headline: z.string(),
      subtext: z.string(),
      ctaText: z.string(),
    }),
    submit: z.object({
      heading: z.string(),
      subtext: z.string(),
    }),
    thankYou: z.object({
      heading: z.string(),
      body: z.string(),
      ctaInsights: z.string(),
      ctaStats: z.string(),
    }),
    statistics: z.object({
      heading: z.string(),
      subtext: z.string(),
      pressuresHeading: z.string(),
      themesHeading: z.string(),
      emptyHeading: z.string(),
      emptyBody: z.string(),
    }),
    insights: z.object({
      heading: z.string(),
      subtext: z.string(),
      previewHeading: z.string(),
      previewLink: z.string(),
      emptyHeading: z.string(),
      emptyBody: z.string(),
    }),
  }),

  questions: z.object({
    fixed: z.array(fixedQuestionSchema).min(1),
  }),

  prompts: z.object({
    adaptiveQuestions: z.string(),
    insightSystem: z.string(),
    insightUser: z.string(),
    themeExtraction: z.string(),
    moderation: z.string(),
  }),

  fallbackThemeKeywords: z.record(z.string(), z.array(z.string())),

  operational: z.object({
    themeExtractionInterval: z.number().int().min(1),
    insightInterval: z.number().int().min(1),
    insightCooldownMs: z.number().int().min(0),
    statisticsCacheTtlMs: z.number().int().min(0),
    minSubmissionsForAI: z.number().int().min(1),
  }),

  seedData: z.array(seedEntrySchema).optional(),
});

export type SurveyConfig = z.infer<typeof surveyConfigSchema>;
