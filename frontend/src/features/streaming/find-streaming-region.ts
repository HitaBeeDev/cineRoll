import { STREAMING_REGIONS } from "@/lib/streaming/streaming-regions";

/** "de" from the URL → "DE" if it is a country with streaming pages; null otherwise. */
export function findStreamingRegion(segment: string): string | null {
  const code = segment.toUpperCase();
  return segment === segment.toLowerCase() && (STREAMING_REGIONS as readonly string[]).includes(code) ? code : null;
}
