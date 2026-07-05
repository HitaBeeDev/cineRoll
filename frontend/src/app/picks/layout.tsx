import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tonight's Picks — Curated Award-Winning Films to Watch",
  description:
    "A fresh, hand-curated set of award-winning films to watch tonight, spanning decades and genres — drawn from CineRoll's Oscar, Golden Globe, Cannes, and Berlinale dataset.",
};

export default function PicksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
