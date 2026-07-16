import { UserAvatar } from "@/components/user-avatar";
import type { ProfileIdentityProps } from "../profile-component-types";

export function ProfileIdentity({ name, email, image }: ProfileIdentityProps) {
  return (
    <div className="flex items-center gap-5">
      <UserAvatar image={image} name={name} email={email} size={56} />
      <div className="min-w-0">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0]">
          {name ?? "Your Profile"}
        </h1>
      </div>
    </div>
  );
}
