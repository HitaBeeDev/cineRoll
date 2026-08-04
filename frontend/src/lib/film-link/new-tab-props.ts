/**
 * `rel` is not decoration: without `noopener` the opened page gets a handle on
 * this one through `window.opener` and can navigate it.
 */
export const NEW_TAB_PROPS = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;
