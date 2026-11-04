import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/ask-ai" },
  title: "Ask AI: Describe a Film, Get an Award Winner",
  description:
    "Describe the film you're in the mood for and CineRoll finds award-winning matches by mood, theme, era or plot from the Oscars, Cannes and more.",
};

export default function AskAiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
