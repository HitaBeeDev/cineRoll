import type { Mode } from "@/components/auth/sign-in-options/types";

/** Footer toggle between signing in and creating an account. */
export function ModeSwitch({
  mode,
  onSwitch,
}: {
  mode: Mode;
  onSwitch: (next: Mode) => void;
}) {
  const isSignin = mode === "signin";
  return (
    <p className="text-center text-xs text-[#8f8fa0]">
      {isSignin ? "New to CineRoll? " : "Already have an account? "}
      <button
        type="button"
        onClick={() => onSwitch(isSignin ? "signup" : "signin")}
        className="font-medium text-[#c8c8d4] underline-offset-2 transition-colors hover:text-[#F5F5F0] hover:underline"
      >
        {isSignin ? "Create an account" : "Sign in"}
      </button>
    </p>
  );
}
