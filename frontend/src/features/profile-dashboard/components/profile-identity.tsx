import { getProfileInitials } from "../get-profile-initials";
import type { ProfileIdentityProps } from "../profile-component-types";

export function ProfileIdentity({ name, email }: ProfileIdentityProps) {
  return (
    <div className="flex items-center gap-5">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#e8453c]/35 bg-[#12121c] font-[family-name:var(--font-geist-mono)] text-base font-bold tracking-wide text-[#e9e9ee]">
        {getProfileInitials(name, email)}
      </div>
      <div className="min-w-0">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0]">
          {name ?? "Your Profile"}
        </h1>
        {email && (
          <p className="mt-1 truncate font-[family-name:var(--font-geist-mono)] text-[12px] normal-case tracking-[0.06em] text-[#9a9aac]">
            {email}
          </p>
        )}
      </div>
    </div>
  );
}
