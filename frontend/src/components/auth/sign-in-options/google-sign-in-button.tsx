import { cn } from "@/lib/utils";
import { GoogleIcon } from "@/components/auth/sign-in-options/google-icon";

export function GoogleSignInButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10",
        "text-sm font-semibold text-[#F5F5F0]",
        "transition hover:border-white/20 hover:bg-white/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        "disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      <GoogleIcon />
      Continue with Google
    </button>
  );
}
