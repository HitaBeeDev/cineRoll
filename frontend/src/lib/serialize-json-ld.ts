// Turns data into the hidden JSON text that search engines read.
//
// The browser ends a <script> block at the first "</script" it finds, even in
// the middle of a sentence. So a film title or plot containing "</script>"
// would close the block early, and the rest would be read as page code.
//
// Swapping every "<" for its escaped form stops that. It also blocks "<!--"
// and "<script", which cause the same trouble. The result is still valid JSON,
// so search engines read exactly the same data. Only text values can contain
// "<", never the JSON punctuation, so replacing all of them is safe.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
