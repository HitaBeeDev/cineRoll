import type { Metadata } from "next";
import { SnobTestClient } from "@/components/snob-test-client";

export const metadata: Metadata = {
  title: "The Snob Test",
  description: "How many award-winning films have you actually seen? Take the CineRoll Snob Test.",
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
