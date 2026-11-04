import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/picks" },
  title: "Tonight's Picks: Award-Winning Films to Watch",
  description:
    "A fresh set of award-winning films to watch tonight, across decades and genres — picked from Oscar, Golden Globe, Cannes and Berlinale winners.",
};

export default function PicksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
