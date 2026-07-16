import type { ProfileStatProps } from "../profile-component-types";

export function ProfileStat({ label, value }: ProfileStatProps) {
  return (
    <div>
      <div className="flex h-8 items-end">
        <span className="font-[family-name:var(--font-display)] text-2xl font-bold leading-none text-[#F5F5F0]">
          {value}
        </span>
      </div>
      <p className="mt-1.5 font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-[0.1em] text-[#b4b4c4]">
        {label}
      </p>
    </div>
  );
}
