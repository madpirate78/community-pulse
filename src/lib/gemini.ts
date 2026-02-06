import { GoogleGenAI } from "@google/genai";

const globalForAI = globalThis as unknown as { __gemini?: GoogleGenAI };

export function getAI(): GoogleGenAI {
  if (!globalForAI.__gemini) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    globalForAI.__gemini = new GoogleGenAI({ apiKey });
  }
  return globalForAI.__gemini;
}

export const MODELS = {
  flash: "gemini-3-flash-preview",
  pro: "gemini-3-pro-preview",
} as const;
