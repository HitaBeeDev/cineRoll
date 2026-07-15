import { RetryButton } from "@/components/retry-button";
import type { ProfileCollectionErrorProps } from "./profile-collection-props";

export function ProfileCollectionError({
  collectionName,
}: ProfileCollectionErrorProps) {
  return (
    <div className="mt-10 flex flex-col items-center gap-5 rounded-xl border border-[#e8453c]/25 bg-[#0d0d1a] px-6 py-20 text-center">
      <p className="max-w-sm font-[family-name:var(--font-geist-mono)] text-sm leading-relaxed text-[#9a9aac]">
        We couldn’t load your {collectionName}. This is usually a hiccup on our
        end — check your connection and try again.
      </p>
      <RetryButton />
    </div>
  );
}
