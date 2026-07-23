import { Clapperboard, Maximize2, Zap } from "lucide-react";

// Why install — value props taught with icons (real-app onboarding).
const VALUE_PROPS = [
  { icon: Zap, text: "Launches instantly — no address bar" },
  { icon: Maximize2, text: "Full-screen, just like a real app" },
  { icon: Clapperboard, text: "Tonight's roll, one tap from home" },
];

export function ValuePropsList() {
  return (
    <ul className="mt-4 space-y-2">
      {VALUE_PROPS.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#242438] bg-[#11111b] text-[#e8453c]">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-[13px] leading-5 text-[#c4c4d2]">{text}</span>
        </li>
      ))}
    </ul>
  );
}
