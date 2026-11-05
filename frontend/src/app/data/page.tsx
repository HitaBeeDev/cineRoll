import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { DataContent } from "@/features/data-page/components/data-content";
import { DataHero } from "@/features/data-page/components/data-hero";
import { fetchDataPage } from "@/features/data-page/fetch-data-page";

export const metadata: Metadata = {
  alternates: { canonical: "/data" },
  title: "Catalogue Data: Award Coverage by Decade",
  description:
    "Live numbers: films, nominations and wins on record, Oscar, Golden Globe, Cannes and Berlinale coverage per decade, and the years still missing.",
};

// Regenerated at most daily, like the data it reads.
export const revalidate = 86400;

export default async function DataPage() {
  const data = await fetchDataPage();

  return (
    <main className="min-h-screen bg-ink-950 text-[#f4f4f5]">
      <AppHeader />
      <DataHero updatedAt={data.updatedAt} />
      <DataContent data={data} />
    </main>
  );
}
