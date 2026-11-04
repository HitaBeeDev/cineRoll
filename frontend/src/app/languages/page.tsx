import type { Metadata } from "next";
import { PlaceIndexPage } from "@/features/places/components/place-index-page";
import { PLACE_COPY } from "@/features/places/place-copy";

export const metadata: Metadata = {
  alternates: { canonical: "/languages" },
  title: PLACE_COPY.languages.indexTitle,
  description: PLACE_COPY.languages.indexIntro,
};

// Rendered per request (the list behind it is a cached API call), never at
// build time, so a build never depends on the backend.
export const dynamic = "force-dynamic";

export default function LanguageIndexPage() {
  return <PlaceIndexPage kind="languages" />;
}
