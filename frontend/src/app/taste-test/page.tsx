import type { Metadata } from "next";
import { TasteTestClient } from "@/components/taste-test-client";

const TITLE = "The Taste Test";
const DESC =
  "This film or that one? Ten quick picks and CineRoll names your taste — then hands you what to watch next.";
const OG = `/api/og?title=${encodeURIComponent(TITLE)}&subtitle=${encodeURIComponent(DESC)}`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  openGraph: {
    title: TITLE,
    description: DESC,
    type: "website",
    images: [{ url: OG, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: [{ url: OG, width: 1200, height: 630, alt: TITLE }],
  },
};

export default function TasteTestPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: "The CineRoll Taste Test",
    description: DESC,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <TasteTestClient />
    </>
  );
}
