export type StructuralFilters = {
  language?: string | null | undefined;
  genre?: string | null | undefined;
  contentType?: string | null | undefined;
  awardBody?: string | null | undefined;
  category?: string | null | undefined;
  awardYear?: number | null | undefined;
  decadeMin?: number | null | undefined;
  decadeMax?: number | null | undefined;
  [key: string]: unknown;
};

export type StructuralFilterValidationResult = {
  filters: Record<string, unknown>;
  dropped: string[];
};
