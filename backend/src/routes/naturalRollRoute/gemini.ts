import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { ResponseSchema } from "@google/generative-ai";

import { config } from "../../config";
import { GEMINI_MODEL } from "./constants";

const nullableStringArray = {
  type: SchemaType.ARRAY,
  items: { type: SchemaType.STRING },
  nullable: true,
} as const;

export const stage1ResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    language: { type: SchemaType.STRING, nullable: true },
    requiredGenres: nullableStringArray,
    preferredGenres: nullableStringArray,
    contentType: { type: SchemaType.STRING, nullable: true },
    awardBody: { type: SchemaType.STRING, format: "enum", enum: ["oscar", "goldenglobe", "cannes", "all"], nullable: true },
    winnerOnly: { type: SchemaType.BOOLEAN, nullable: true },
    nominatedOnly: { type: SchemaType.BOOLEAN, nullable: true },
    decadeMin: { type: SchemaType.INTEGER, nullable: true },
    decadeMax: { type: SchemaType.INTEGER, nullable: true },
    director: { type: SchemaType.STRING, nullable: true },
    person: { type: SchemaType.STRING, nullable: true },
    awardYear: { type: SchemaType.INTEGER, nullable: true },
    category: { type: SchemaType.STRING, nullable: true },
    femaleDirectorOnly: { type: SchemaType.BOOLEAN, nullable: true },
    tones: nullableStringArray,
    themes: nullableStringArray,
    keywords: nullableStringArray,
    resultCount: { type: SchemaType.INTEGER, nullable: true },
  },
};

export const rerankResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    picks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
};

export function parseGeminiJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);

  return JSON.parse(fenced?.[1] ?? trimmed);
}

export async function generateGeminiJson(
  prompt: string,
  systemInstruction: string,
  responseSchema: ResponseSchema,
  temperature: number,
  maxOutputTokens: number,
): Promise<unknown> {
  if (!config.geminiApiKey) return null;

  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
      temperature,
      maxOutputTokens,
    },
  });
  const result = await model.generateContent(prompt);

  return parseGeminiJson(result.response.text());
}

export function hasGeminiApiKey(): boolean {
  return Boolean(config.geminiApiKey);
}
