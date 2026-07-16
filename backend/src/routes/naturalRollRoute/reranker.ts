import { RandomFilmRow } from "../random";
import { generateGeminiJson, hasGeminiApiKey, rerankResponseSchema } from "./gemini";
import { localRerankCandidates } from "./localReranker";
import { rerankInstruction, rerankPrompt } from "./rerankPrompt";
import { rerankOutputSchema } from "./schemas";
import { SoftPreferences } from "./softPreferences";

export async function rerankCandidates(
  prompt: string,
  preferences: SoftPreferences,
  candidates: RandomFilmRow[],
  count: number,
): Promise<string[]> {
  if (!hasGeminiApiKey()) return localRerankCandidates(prompt, preferences, candidates, count);

  try {
    const parsed = await generateGeminiJson(
      rerankPrompt(prompt, preferences, candidates, count),
      rerankInstruction,
      rerankResponseSchema,
      0.2,
      128,
    );
    return validPicks(rerankOutputSchema.parse(parsed).picks, candidates, count);
  } catch {
    return localRerankCandidates(prompt, preferences, candidates, count);
  }
}

function validPicks(picks: string[], candidates: RandomFilmRow[], count: number): string[] {
  const validIds = new Set(candidates.map(film => film.id));

  return picks.filter(id => validIds.has(id)).slice(0, count);
}
