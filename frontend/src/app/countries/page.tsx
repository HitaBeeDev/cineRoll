import type { Metadata } from "next";
import { PlaceIndexPage } from "@/features/places/components/place-index-page";
import { PLACE_COPY } from "@/features/places/place-copy";

export const metadata: Metadata = {
  alternates: { canonical: "/countries" },
  title: PLACE_COPY.countries.indexTitle,
  description: PLACE_COPY.countries.indexDescription,
};

// Rendered per request (the list behind it is a cached API call), never at
// build time, so a build never depends on the backend.
export const dynamic = "force-dynamic";

export default function CountryIndexPage() {
  return <PlaceIndexPage kind="countries" />;
}
