import { tokenize } from "../tokenize";

const MINIMUM_PROMPT_TOKEN_LENGTH = 3;

export const createPromptTokenSet = (prompt: string): Set<string> =>
  new Set(tokenize(prompt).filter(
    token => token.length >= MINIMUM_PROMPT_TOKEN_LENGTH,
  ));
