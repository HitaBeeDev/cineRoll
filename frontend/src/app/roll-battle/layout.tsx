import type { Metadata } from "next";

// Title/description default for the interactive battle page. The /result child
// route sets its own dynamic, shareable metadata via generateMetadata, so no
// robots rule is set here (result stays indexable).
export const metadata: Metadata = {
  title: "Roll Battle — Head-to-Head Award-Winning Films",
  description:
    "Pit two award-winning films head-to-head and roll to crown a winner — a quick, playful way to discover great cinema on CineRoll.",
};

export default function RollBattleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
