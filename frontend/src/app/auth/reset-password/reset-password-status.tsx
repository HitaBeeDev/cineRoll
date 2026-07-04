import Link from "next/link";
import { cn } from "@/lib/utils";

export function InvalidResetLink() {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:text-4xl">
        Invalid <span className="text-[#e8453c]">link</span>
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#c8c8d4]">
        This reset link is missing or malformed. Request a new one to continue.
      </p>
      <Link
        href="/auth/forgot-password"
        className="mt-6 inline-block text-xs text-[#8f8fa0] underline-offset-2 transition-colors hover:text-[#c8c8d4] hover:underline"
      >
        Request a new link
      </Link>
    </div>
  );
}

export function ResetPasswordSuccess() {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:text-4xl">
        Password <span className="text-[#e8453c]">updated</span>
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#c8c8d4]">
        Your password has been changed. You can now sign in with it.
      </p>
      <Link
        href="/auth/signin"
        className={cn(
          "mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#e8453c]",
          "text-sm font-semibold text-[#F5F5F0] transition hover:bg-[#f2554c]",
        )}
      >
        Go to sign in
      </Link>
    </div>
  );
}
