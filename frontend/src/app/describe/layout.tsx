import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Describe It — Find an Award-Winning Film by Describing It",
  description:
    "Describe the film you're in the mood for in plain words and CineRoll finds award-winning matches by mood, theme, era, or plot — searching the Oscars, Golden Globes, Cannes, and Berlinale.",
};

export default function DescribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
