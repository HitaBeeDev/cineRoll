import { createHash } from "crypto";

import { cache, cacheKeys } from "../../lib/cache";
import { EXTRACT_CACHE_TTL_MS } from "./constants";
import { generateGeminiJson, hasGeminiApiKey, stage1ResponseSchema } from "./gemini";
import {
  extractLocalHardConstraints,
  extractLocalStructuralFilters,
} from "./localStructuralExtractor";
import { Stage1Filters, stage1Schema } from "./schemas";
import { stage1Instruction } from "./structuralPrompt";

export async function extractStructuralFilters(prompt: string): Promise<Stage1Filters> {
  // The local extractor is pure and cheap, so it's only the Gemini path worth
  // caching against.
  if (!hasGeminiApiKey()) {
    return extractLocalStructuralFilters(prompt);
  }

  const cacheKey = cacheKeys.naturalRollFilters(promptHash(prompt));
  const cached = await cache.get<Stage1Filters>(cacheKey);
  if (cached) return cached;

  try {
    const parsed = await generateGeminiJson(prompt, stage1Instruction, stage1ResponseSchema, 0.1, 512);
    const filters = withLocalHardConstraints(prompt, stage1Schema.parse(parsed));
    // Cache only the successful Gemini result — never the local fallback, so a
    // transient Gemini blip doesn't pin the inferior extraction for a full day.
    await cache.set(cacheKey, filters, EXTRACT_CACHE_TTL_MS);
    return filters;
  } catch (error) {
    console.warn("Gemini structural extraction failed; using local fallback.", error);
    return extractLocalStructuralFilters(prompt);
  }
}

// Hard constraints (movie vs series, "only one") must never depend on the
// LLM's recall: when the user stated them in plain words, the deterministic
// regex extraction backfills whatever the model omitted. The model's own value
// wins when both exist — it sees context regexes can't ("not a movie").
function withLocalHardConstraints(prompt: string, filters: Stage1Filters): Stage1Filters {
  const local = extractLocalHardConstraints(prompt);

  return {
    ...filters,
    contentType: filters.contentType ?? local.contentType,
    resultCount: filters.resultCount ?? local.resultCount,
  };
}

// Normalize away cosmetic differences (case, surrounding and collapsed
// whitespace) so equivalent prompts share a cache entry, then hash to keep keys
// bounded and free of raw user text.
function promptHash(prompt: string): string {
  const normalized = prompt.trim().toLowerCase().replace(/\s+/g, " ");
  return createHash("sha1").update(normalized).digest("hex");
}
