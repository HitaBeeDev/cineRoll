/** A streaming service with a page in one country. */
export type StreamingService = {
  id: number;
  slug: string;
  name: string;
  logoPath: string | null;
  /** Award films on it in that country. */
  films: number;
};
