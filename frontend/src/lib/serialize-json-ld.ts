// A <script> element's contents are raw text: the parser ends the block at the
// first "</script" it sees, wherever it appears. So a film title or synopsis
// containing "</script>" would close the tag early and let the rest of the
// string be parsed as markup.
//
// Escaping every "<" as a unicode escape removes the whole class of breakouts —
// "</script", "<!--", "<script" — and stays valid JSON, so consumers parse the
// identical object. "<" only ever appears inside string values (no JSON
// structural character is "<"), which is why blanket-replacing it is safe.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
