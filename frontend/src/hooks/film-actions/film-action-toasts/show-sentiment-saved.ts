import type { Sentiment, Toast } from "../types";

export function showSentimentSaved(
  toast: Toast,
  sentiment: Sentiment,
  filmTitle: string,
): void {
  const titles: Record<Exclude<Sentiment, null>, string> = {
    like: "Glad you liked it",
    dislike: "Noted — not for you",
  };
  toast({
    variant: sentiment === null ? "default" : "success",
    title: sentiment === null ? "Rating cleared" : titles[sentiment],
    description: filmTitle,
  });
}
