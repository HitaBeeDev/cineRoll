import { FOCUS_RING } from "@/components/film-detail-actions/styles/focus-ring";
import { HERO_LABEL_TYPE } from "@/components/film-detail-actions/styles/hero-label-type";

// Each half lights on its own hover, so the split reads as two reachable
// targets rather than one button with a mystery edge.
export const SPLIT_HALF = `flex items-center justify-center transition-colors hover:bg-white/[0.10] disabled:cursor-not-allowed disabled:opacity-60 ${HERO_LABEL_TYPE} ${FOCUS_RING}`;
