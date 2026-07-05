import type { Metadata } from "next";
import { SnobTestClient } from "@/components/snob-test-client";

const SNOB_TITLE = "The Snob Test";
const SNOB_DESC = "How many award-winning films have you actually seen? Take the CineRoll Snob Test.";
const SNOB_OG = `/api/og?title=${encodeURIComponent("The Snob Test")}&subtitle=${encodeURIComponent(SNOB_DESC)}`;

export const metadata: Metadata = {
  title: SNOB_TITLE,
  description: SNOB_DESC,
  openGraph: {
    title: SNOB_TITLE,
    description: SNOB_DESC,
    type: "website",
    images: [{ url: SNOB_OG, width: 1200, height: 630, alt: SNOB_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: SNOB_TITLE,
    description: SNOB_DESC,
    images: [{ url: SNOB_OG, width: 1200, height: 630, alt: SNOB_TITLE }],
  },
};

export default function SnobTestPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: "The CineRoll Snob Test",
    description: "How many award-winning films have you actually seen? Take the CineRoll Snob Test.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SnobTestClient />
    </>
  );
}
