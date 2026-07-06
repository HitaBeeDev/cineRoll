import { RetryButton } from "./retry-button";

type ErrorStateProps = {
  onRetry: () => void;
};

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-20 text-center">
      <p className="text-sm text-[#888899]">Couldn&apos;t load a film. Please try again.</p>
      <RetryButton onClick={onRetry} />
    </div>
  );
}
