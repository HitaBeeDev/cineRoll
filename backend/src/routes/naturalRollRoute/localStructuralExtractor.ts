import {
  LOCAL_CATEGORY_PATTERNS,
  LOCAL_KEYWORD_PATTERNS,
  LOCAL_LANGUAGE_PATTERNS,
  LOCAL_TONE_PATTERNS,
} from "./patterns";
import { stage1Schema, type Stage1Filters } from "./schemas";
import { extractAwardIntent } from "./structuralExtraction/extractAwardIntent";
import { extractAwardYear } from "./structuralExtraction/extractAwardYear";
import { extractContentType } from "./structuralExtraction/extractContentType";
import { extractEraFilters } from "./structuralExtraction/extractEraFilters";
import { extractGenreSplit } from "./structuralExtraction/extractGenreSplit";
import { extractResultCount } from "./structuralExtraction/extractResultCount";
import {
  findAllPatternMatches,
  findFirstPatternMatch,
} from "./structuralExtraction/patternMatches";

export const extractLocalStructuralFilters = (prompt: string): Stage1Filters =>
  stage1Schema.parse({
    language: findFirstPatternMatch(prompt, LOCAL_LANGUAGE_PATTERNS),
    ...extractGenreSplit(prompt),
    category: findFirstPatternMatch(prompt, LOCAL_CATEGORY_PATTERNS),
    tones: findAllPatternMatches(prompt, LOCAL_TONE_PATTERNS),
    keywords: findAllPatternMatches(prompt, LOCAL_KEYWORD_PATTERNS),
    contentType: extractContentType(prompt),
    resultCount: extractResultCount(prompt),
    ...extractAwardIntent(prompt),
    ...extractEraFilters(prompt),
    awardYear: extractAwardYear(prompt),
  });
