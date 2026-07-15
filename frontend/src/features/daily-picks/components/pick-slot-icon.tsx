import { Clapperboard, Star, Trophy } from "lucide-react";
import type { PickSlotIconProps } from "../component-props";

export function PickSlotIcon({ icon }: PickSlotIconProps) {
  if (icon === "trophy") {
    return <Trophy className="h-3.5 w-3.5" aria-hidden />;
  }
  if (icon === "clapperboard") {
    return <Clapperboard className="h-3.5 w-3.5" aria-hidden />;
  }
  return <Star className="h-3.5 w-3.5" aria-hidden />;
}
