import type { FilterState } from "@cineroll/types";
import type { RandomResult } from "@/lib/api";

/** Which surface asked for the draw. Recorded, never read by selection. */
export type RollSource = "home_roll" | "browse_results";

export type UseRollSessionInput = {
  filters: FilterState;
  userId?: string | undefined;
  /** Signed-in only; ignored without a user id, as the server would ignore it. */
  personalized?: boolean | undefined;
  source: RollSource;
  /** Extra context for the request event — the home page reports filter use. */
  requestContext?: Record<string, unknown> | undefined;
  /** Runs before the request goes out, for surfaces that animate the wait. */
  onRollStart?: (() => void) | undefined;
  onResult?: ((result: RandomResult) => void) | undefined;
  onError?: ((error: unknown) => void) | undefined;
};
