/**
 * Two lines, because the box is `flex-1` and a laptop-height viewport leaves it
 * around 119px — room for two lines of the prompt's own leading and no more. A
 * four-line placeholder was cut mid-sentence and put a scrollbar inside an empty
 * input. The dropped English examples are the chips directly below the box; what
 * a chip cannot say is that the field takes any language, so the example that
 * stays is not in English.
 */
export const PROMPT_PLACEHOLDER = [
  "Describe the film you want tonight...",
  "Or: Ein ruhiger Oscar-Gewinner mit Drama",
].join("\n");
