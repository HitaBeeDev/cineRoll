import { getApiErrorCode } from "./get-api-error-code";

type ErrorToast = (options: {
  variant: "error";
  title: string;
  description: string;
}) => void;

export function presentRollError(
  error: unknown,
  setCount: (count: number) => void,
  toast: ErrorToast,
): void {
  if (getApiErrorCode(error) === "NO_FILMS_FOUND") {
    setCount(0);
    toast({
      variant: "error",
      title: "No matches",
      description: "No films match your filters — try adjusting them.",
    });
    return;
  }
  toast({
    variant: "error",
    title: "Couldn't connect",
    description: "Check your connection and try again.",
  });
}
