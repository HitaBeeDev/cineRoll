const GORE_TOKENS = ["gore", "bloody", "blood", "slasher"];

export const containsGoreSignal = (tokens: Set<string>): boolean =>
  GORE_TOKENS.some(token => tokens.has(token));
