import { generateGeminiJson, hasGeminiApiKey, stage1ResponseSchema } from "./gemini";
import { extractLocalStructuralFilters } from "./localStructuralExtractor";
import { Stage1Filters, stage1Schema } from "./schemas";
import { stage1Instruction } from "./structuralPrompt";

export async function extractStructuralFilters(prompt: string): Promise<Stage1Filters> {
  if (!hasGeminiApiKey()) {
    return extractLocalStructuralFilters(prompt);
  }

  try {
    const parsed = await generateGeminiJson(prompt, stage1Instruction, stage1ResponseSchema, 0.1, 256);
    return stage1Schema.parse(parsed);
  } catch (error) {
    console.warn("Gemini structural extraction failed; using local fallback.", error);
    return extractLocalStructuralFilters(prompt);
  }
}
