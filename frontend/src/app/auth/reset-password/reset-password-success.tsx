import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export function ResetPasswordSuccess() {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:text-4xl">
        Password <span className="text-accent">updated</span>
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#c8c8d4]">
        Your password has been changed. You can now sign in with it.
      </p>
      <Link
        href="/auth/signin"
        className={cn(
          "mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-accent",
          "text-sm font-semibold text-fg-hi transition hover:bg-[#f2554c]",
        )}
      >
        Go to sign in
      </Link>
    </div>
  );
}
