import { Suspense } from "react";
import { BrowsePageClient } from "@/components/browse-page-client";

export const metadata = {
  title: "Browse & Filter Award-Winning Films",
  description:
    "Browse and filter every Oscar, Golden Globe, Cannes, and Berlinale film in CineRoll's dataset — search by title, year, genre, country, and award.",
};

export default function BrowsePage() {
  return (
    <Suspense fallback={null}>
      <BrowsePageClient />
    </Suspense>
  );
}
