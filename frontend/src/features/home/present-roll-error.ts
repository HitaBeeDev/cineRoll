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
  const code = error instanceof Error ? (error as Error & { code?: string }).code : undefined;
  if (code === "NO_FILMS_FOUND") {
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
