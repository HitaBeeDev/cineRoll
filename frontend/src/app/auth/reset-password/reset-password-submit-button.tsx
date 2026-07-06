import { cn } from "@/lib/utils";

type ResetPasswordSubmitButtonProps = {
  isLoading: boolean;
};

export function ResetPasswordSubmitButton({ isLoading }: ResetPasswordSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={cn(
        "h-12 w-full rounded-xl bg-[#e8453c]",
        "text-sm font-semibold text-[#F5F5F0]",
        "shadow-[0_10px_28px_rgba(232,69,60,0.16)] transition hover:bg-[#f2554c]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        "disabled:cursor-not-allowed disabled:bg-[#8f302b] disabled:text-[#c9a1a0] disabled:shadow-none",
      )}
    >
      {isLoading ? "Updating..." : "Update password"}
    </button>
  );
}
