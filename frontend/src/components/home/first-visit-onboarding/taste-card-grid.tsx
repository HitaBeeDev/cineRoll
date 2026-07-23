import type { TasteCardFilm } from "@/lib/api";
import type { TasteCardsStatus } from "@/components/home/first-visit-onboarding/types";
import { TasteCard } from "@/components/home/first-visit-onboarding/taste-card";
import { TasteCardsError } from "@/components/home/first-visit-onboarding/taste-cards-error";
import { TasteCardSkeleton } from "@/components/home/first-visit-onboarding/taste-card-skeleton";

const CARD_COUNT = 8;

/** Right column: the poster grid across its error / ready / loading states. */
export function TasteCardGrid({
  tasteCards,
  status,
  selectedIds,
  onToggle,
  onRetry,
}: {
  tasteCards: TasteCardFilm[];
  status: TasteCardsStatus;
  selectedIds: Set<string>;
  onToggle: (filmId: string) => void;
  onRetry: () => void;
}) {
  return (
    <section className="min-h-0 min-w-0">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {status === "error" ? (
          <TasteCardsError onRetry={onRetry} />
        ) : status === "ready" && tasteCards.length > 0 ? (
          tasteCards.slice(0, CARD_COUNT).map((film) => (
            <TasteCard
              key={film.id}
              film={film}
              selected={selectedIds.has(film.id)}
              onToggle={() => onToggle(film.id)}
            />
          ))
        ) : (
          Array.from({ length: CARD_COUNT }).map((_, i) => <TasteCardSkeleton key={i} />)
        )}
      </div>
    </section>
  );
}
