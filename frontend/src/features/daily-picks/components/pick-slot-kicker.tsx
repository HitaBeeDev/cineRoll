import { DAILY_PICKS_ACCENT } from "../config";
import type { PickSlotKickerProps } from "../component-props";
import { PickSlotIcon } from "./pick-slot-icon";

export function PickSlotKicker({ slot }: PickSlotKickerProps) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span
        className="font-[family-name:var(--font-display)] text-base font-black leading-none"
        style={{ color: DAILY_PICKS_ACCENT }}
      >
        {slot.num}
      </span>
      <span className="inline-flex items-center gap-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-[#d4d4e0]">
        <PickSlotIcon icon={slot.icon} />
        {slot.label}
      </span>
    </div>
  );
}
