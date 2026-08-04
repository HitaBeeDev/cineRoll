import type { RerollPenalty } from "@/lib/api";

export function createEmptyRerollPenalty(): RerollPenalty {
  return { genre: {}, contentType: {} };
}
