import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/ask-ai" },
  title: "AI Movie Recommendations by Mood & Story",
  description:
    "Ask CineRoll's AI movie recommender what to watch. Describe a mood, story, theme or era to find matching films from the Oscars, Cannes and more.",
};

export default function AskAiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
