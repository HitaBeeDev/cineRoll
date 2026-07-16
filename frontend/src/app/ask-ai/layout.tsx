import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask AI — Find an Award-Winning Film by Describing It",
  description:
    "Describe the film you're in the mood for in plain words and CineRoll finds award-winning matches by mood, theme, era, or plot — searching the Oscars, Golden Globes, Cannes, and Berlinale.",
};

export default function AskAiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
