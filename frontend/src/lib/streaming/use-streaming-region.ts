import { useViewerRegion } from "./use-viewer-region";

/** The country streaming filters mean: the one chosen, else the viewer's, else the US. */
export function useStreamingRegion(chosen: string): string {
  const viewer = useViewerRegion();
  return chosen || viewer || "US";
}
