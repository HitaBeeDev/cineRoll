export type MatchPattern<T> = [pattern: RegExp, value: T];

export const findFirstPatternMatch = <T>(
  prompt: string,
  patterns: Array<MatchPattern<T>>,
): T | undefined => patterns.find(([pattern]) => pattern.test(prompt))?.[1];

export const findAllPatternMatches = <T>(
  prompt: string,
  patterns: Array<MatchPattern<T>>,
): T[] | undefined => {
  const matches = patterns
    .filter(([pattern]) => pattern.test(prompt))
    .map(([, value]) => value);

  return matches.length > 0 ? [...new Set(matches)] : undefined;
};
