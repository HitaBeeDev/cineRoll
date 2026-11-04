/** API query params, as the films and random endpoints read them. */
export type ToolParams = Record<string, string>;

/** One option a tool lets the visitor pick before rolling (a decade, a genre). */
export type ToolChoice = { label: string; params: ToolParams };

/**
 * A "random film" tool page. Each is a real query people search for, answered
 * by the same roll engine with a fixed filter — one template, many pages.
 */
export type ToolDefinition = {
  slug: string;
  /** Short name for links between tools. */
  name: string;
  h1: string;
  /** <title>, under ~45 characters (the layout appends " | CineRoll"). */
  title: string;
  description: string;
  /** Intro copy above the roller. `{count}` is replaced with the pool size. */
  intro: string[];
  /** Filter every roll on this page uses. */
  params: ToolParams;
  /** Optional narrowing the visitor picks first. */
  choices?: ToolChoice[];
};
