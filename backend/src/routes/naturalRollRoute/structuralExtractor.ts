import { createHash } from "crypto";

import { cache, cacheKeys } from "../../lib/cache";
import { EXTRACT_CACHE_TTL_MS } from "./constants";
import { generateGeminiJson, hasGeminiApiKey, stage1ResponseSchema } from "./gemini";
import { extractLocalStructuralFilters } from "./localStructuralExtractor";
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
    const filters = withLocalBackstop(prompt, stage1Schema.parse(parsed));
    // Cache only the successful Gemini result — never the local fallback, so a
    // transient Gemini blip doesn't pin the inferior extraction for a full day.
    await cache.set(cacheKey, filters, EXTRACT_CACHE_TTL_MS);
    return filters;
  } catch (error) {
    console.warn("Gemini structural extraction failed; using local fallback.", error);
    return extractLocalStructuralFilters(prompt);
  }
}

// Anything the user stated in plain words must never depend on the LLM's
// recall — the deterministic regex extraction backfills whatever the model
// omitted. (This bit in production: Gemini returned no genres for "a beautiful,
// emotional romance…" and the whole catalog became eligible.) The model's own
// value wins where both exist — it sees context regexes can't ("not a movie").
export function withLocalBackstop(prompt: string, filters: Stage1Filters): Stage1Filters {
  const local = extractLocalStructuralFilters(prompt);
  const geminiSawGenres =
    (filters.requiredGenres?.length ?? 0) + (filters.preferredGenres?.length ?? 0) > 0;

  return {
    ...filters,
    contentType: filters.contentType ?? local.contentType,
    resultCount: filters.resultCount ?? local.resultCount,
    // No genres from the model → trust the local required/preferred split
    // wholesale. Otherwise keep the model's split (it understands negation and
    // phrasing) and only add locally-found genres it missed as preferred.
    requiredGenres: geminiSawGenres ? filters.requiredGenres : local.requiredGenres,
    preferredGenres: geminiSawGenres
      ? mergeLists(filters.preferredGenres, missingLocalGenres(filters, local))
      : local.preferredGenres,
    tones: mergeLists(filters.tones, local.tones),
    keywords: mergeLists(filters.keywords, local.keywords),
  };
}

function missingLocalGenres(filters: Stage1Filters, local: Stage1Filters): string[] {
  const seen = new Set(
    [...(filters.requiredGenres ?? []), ...(filters.preferredGenres ?? [])].map(genre =>
      genre.toLowerCase(),
    ),
  );

  return [...(local.requiredGenres ?? []), ...(local.preferredGenres ?? [])].filter(
    genre => !seen.has(genre.toLowerCase()),
  );
}

function mergeLists(
  primary: string[] | null | undefined,
  extra: string[] | null | undefined,
): string[] | undefined {
  const merged = [...new Set([...(primary ?? []), ...(extra ?? [])])];

  return merged.length > 0 ? merged : undefined;
}

// Normalize away cosmetic differences (case, surrounding and collapsed
// whitespace) so equivalent prompts share a cache entry, then hash to keep keys
// bounded and free of raw user text.
function promptHash(prompt: string): string {
  const normalized = prompt.trim().toLowerCase().replace(/\s+/g, " ");
  return createHash("sha1").update(normalized).digest("hex");
}
