import { ClueCardItem } from "./clue-card-item";
import type { ClueCard } from "../types";

type ClueCardsProps = {
  cards: ClueCard[];
};

export function ClueCards({ cards }: ClueCardsProps) {
  if (cards.length === 0) return null;

  return (
    <div className="mb-3 flex shrink-0 flex-wrap gap-2">
      {cards.map((card) => (
        <ClueCardItem card={card} key={card.label} />
      ))}
    </div>
  );
}
