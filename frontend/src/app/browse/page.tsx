import { Suspense } from "react";
import { BrowsePageClient } from "@/components/browse-page-client";

export const metadata = {
  title: "Browse Films",
  description: "Browse and filter CineRoll's award film dataset.",
};

export default function BrowsePage() {
  return (
    <Suspense fallback={null}>
      <BrowsePageClient />
    </Suspense>
  );
}
