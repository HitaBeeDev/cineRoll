import { Suspense } from "react";
import { BrowsePageClient } from "@/components/browse-page-client";
import { BrowseStaticPreview } from "@/components/browse/browse-static-preview";
import { fetchBrowsePreview } from "@/lib/browse/fetch-browse-preview";

export const metadata = {
  title: "Browse & Filter Award-Winning Films",
  description:
    "Browse and filter every Oscar, Golden Globe, Cannes, and Berlinale film in CineRoll's dataset — search by title, year, genre, country, and award.",
  // Filters live in the query string and are rendered client-side, so every
  // filtered or paginated view points search engines at the one browse page.
  alternates: { canonical: "/browse" },
};

// Regenerated at most daily — see fetchBrowsePreview.
export const revalidate = 86400;

export default async function BrowsePage() {
  const preview = await fetchBrowsePreview();

  // The fallback is what the server sends: real film links for crawlers and a
  // non-empty first paint. The interactive page replaces it after hydration.
  return (
    <Suspense fallback={<BrowseStaticPreview preview={preview} />}>
      <BrowsePageClient />
    </Suspense>
  );
}
