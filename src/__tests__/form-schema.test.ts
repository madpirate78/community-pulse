import { describe, test, expect } from "bun:test";
import { fixedQuestionsSchema } from "@/lib/types";
import { config } from "@/config";

// Build a valid answer set from whatever questions the config defines.
function validAnswers(): Record<string, unknown> {
  const answers: Record<string, unknown> = {};
  for (const q of config.questions.fixed) {
    switch (q.type) {
      case "choice":
        answers[q.fieldName] = q.options[0].value;
        break;
      case "scale":
        answers[q.fieldName] = q.min;
        break;
      case "text":
        answers[q.fieldName] = "a".repeat(Math.max(q.minLength, 1));
        break;
    }
  }
  return answers;
}

describe("dynamic fixed-questions schema", () => {
  const textQuestion = config.questions.fixed.find((q) => q.type === "text");
  const choiceQuestion = config.questions.fixed.find((q) => q.type === "choice");
  const scaleQuestion = config.questions.fixed.find((q) => q.type === "scale");

  test("accepts a valid answer set", () => {
    expect(fixedQuestionsSchema.safeParse(validAnswers()).success).toBe(true);
  });

  test("rejects an unknown choice value", () => {
    if (!choiceQuestion) return;
    const answers = validAnswers();
    answers[choiceQuestion.fieldName] = "not-a-real-option";
    expect(fixedQuestionsSchema.safeParse(answers).success).toBe(false);
  });

  test("coerces numeric strings for scale questions", () => {
    if (!scaleQuestion) return;
    const answers = validAnswers();
    answers[scaleQuestion.fieldName] = String(scaleQuestion.min);
    const parsed = fixedQuestionsSchema.safeParse(answers);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data[scaleQuestion.fieldName]).toBe(scaleQuestion.min);
    }
  });

  test("rejects out-of-range scale values", () => {
    if (!scaleQuestion) return;
    const answers = validAnswers();
    answers[scaleQuestion.fieldName] = scaleQuestion.max + 1;
    expect(fixedQuestionsSchema.safeParse(answers).success).toBe(false);
  });

  test("rejects text answers over the configured max length", () => {
    if (!textQuestion) return;
    const answers = validAnswers();
    answers[textQuestion.fieldName] = "a".repeat(textQuestion.maxLength + 1);
    expect(fixedQuestionsSchema.safeParse(answers).success).toBe(false);
  });
});
