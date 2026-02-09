import { describe, test, expect } from "bun:test";
import { surveyConfigSchema } from "@/config/schema";
import rawConfig from "@/config/survey.config";
import { renderPrompt } from "@/lib/prompt-renderer";
import { fixedQuestionsSchema, PRESSURE_OPTIONS, PRESSURE_LABELS } from "@/lib/types";

describe("survey config", () => {
  const config = surveyConfigSchema.parse(rawConfig);

  test("parses without errors", () => {
    expect(config).toBeDefined();
    expect(config.branding.appName).toBeTruthy();
  });

  test("has at least one question of each type", () => {
    const types = config.questions.fixed.map((q) => q.type);
    expect(types).toContain("choice");
    expect(types).toContain("scale");
    expect(types).toContain("text");
  });

  test("choice options have unique values", () => {
    for (const q of config.questions.fixed) {
      if (q.type !== "choice") continue;
      const values = q.options.map((o) => o.value);
      expect(new Set(values).size).toBe(values.length);
    }
  });

  test("all prompt templates are non-empty strings", () => {
    for (const [, prompt] of Object.entries(config.prompts)) {
      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(0);
    }
  });

  test("operational thresholds are sensible", () => {
    expect(config.operational.minSubmissionsForAI).toBeGreaterThanOrEqual(1);
    expect(config.operational.themeExtractionInterval).toBeGreaterThanOrEqual(1);
    expect(config.operational.insightCooldownMs).toBeGreaterThanOrEqual(0);
  });
});

describe("dynamic form schema", () => {
  test("builds a valid Zod schema from config", () => {
    expect(fixedQuestionsSchema).toBeDefined();
    expect(fixedQuestionsSchema.shape).toBeDefined();
  });

  test("derives pressure options from first choice question", () => {
    expect(PRESSURE_OPTIONS.length).toBeGreaterThan(0);
  });

  test("pressure labels map has entries for all options", () => {
    for (const opt of PRESSURE_OPTIONS) {
      expect(PRESSURE_LABELS[opt]).toBeTruthy();
    }
  });
});

describe("prompt renderer", () => {
  test("replaces {{key}} markers", () => {
    expect(renderPrompt("Hello {{name}}", { name: "World" })).toBe("Hello World");
  });

  test("handles numeric values", () => {
    expect(renderPrompt("Count: {{n}}", { n: 42 })).toBe("Count: 42");
  });

  test("replaces missing keys with empty string", () => {
    expect(renderPrompt("Hi {{missing}}", {})).toBe("Hi ");
  });

  test("handles multiple markers", () => {
    expect(renderPrompt("{{a}} and {{b}}", { a: "X", b: "Y" })).toBe("X and Y");
  });
});
