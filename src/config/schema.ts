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

// ─── Seed data entry ────────────────────────────────────────

const seedEntrySchema = z.object({
  responses: z.record(z.string(), z.unknown()),
  adaptiveData: z.array(z.record(z.string(), z.unknown())).optional(),
});

// ─── Top-level config schema ────────────────────────────────

const rateLimitSchema = z.object({
  maxRequests: z.number().int().min(1),
  windowMs: z.number().int().min(1),
});

export const surveyConfigSchema = z.object({
  branding: z.object({
    appName: z.string(),
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
      errorHeading: z.string(),
      errorBody: z.string(),
    }),
    insights: z.object({
      heading: z.string(),
      subtext: z.string(),
      previewHeading: z.string(),
      previewLink: z.string(),
      emptyHeading: z.string(),
      emptyBody: z.string(),
      generatedFrom: z.string(),
      generationTime: z.string(),
    }),
    error: z.object({
      heading: z.string(),
      retryLabel: z.string(),
    }),
    notFound: z.object({
      heading: z.string(),
      body: z.string(),
      ctaHome: z.string(),
    }),
  }),

  ui: z.object({
    nav: z.object({
      submit: z.string(),
      statistics: z.string(),
      insights: z.string(),
    }),
    skipLink: z.string(),
    survey: z.object({
      adaptiveIntro: z.string(),
      adaptiveTextPlaceholder: z.string(),
      continueLabel: z.string(),
      submitLabel: z.string(),
      submittingLabel: z.string(),
      submittingMessage: z.string(),
      loaderMessages: z.array(z.string()).min(1),
    }),
    validation: z.object({
      choiceRequired: z.string(),
      scaleRequired: z.string(),
      textTooShort: z.string(),
      textTooLong: z.string(),
    }),
    errors: z.object({
      busy: z.string(),
      generic: z.string(),
      rateLimited: z.string(),
      submissionsClosed: z.string(),
    }),
    stats: z.object({
      voiceSingular: z.string(),
      voicePlural: z.string(),
      topConcernLabel: z.string(),
      avgChangeLabel: z.string(),
      chartCountLabel: z.string(),
      chartUnit: z.string(),
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
    volumeGuidance: z.object({
      sparse: z.string(),
      building: z.string(),
      substantial: z.string(),
    }),
  }),

  fallbackThemeKeywords: z.record(z.string(), z.array(z.string())),

  operational: z.object({
    themeExtractionInterval: z.number().int().min(1),
    insightInterval: z.number().int().min(1),
    insightCooldownMs: z.number().int().min(0),
    statisticsCacheTtlMs: z.number().int().min(0),
    minSubmissionsForAI: z.number().int().min(1),
    maxSubmissions: z.number().int().min(1).optional(),
    adaptiveAnswerMaxLength: z.number().int().min(1),
    fallbackThemeCount: z.number().int().min(1),
    volumeThresholds: z.object({
      sparse: z.number().int().min(1),
      substantial: z.number().int().min(1),
    }),
    rateLimits: z.object({
      ai: rateLimitSchema,
      read: rateLimitSchema,
      submit: rateLimitSchema,
    }),
  }),

  seedData: z.array(seedEntrySchema).optional(),
});

export type SurveyConfig = z.infer<typeof surveyConfigSchema>;
