import { AppHeader } from "@/components/app-header";
import { JsonLd } from "@/components/json-ld";
import { PicksPageView } from "@/features/daily-picks/components/picks-page-view";
import { fetchServerDailyPicks } from "@/features/daily-picks/fetch-server-daily-picks";
import { formatPicksDate } from "@/features/daily-picks/picks-date/format-picks-date";
import { buildItemList } from "@/lib/seo/build-item-list";

// An hour: the picks turn over at midnight UTC, and a render that caught the
// backend down must not leave the page without them for long. The draws
// themselves are cached for the day (server-seeded-roll.ts).
export const revalidate = 3600;

export default async function PicksPage() {
  const now = new Date();
  const picks = await fetchServerDailyPicks(now);

  return (
    <div className="min-h-screen bg-ink-900 text-fg-hi">
      <AppHeader />
      {picks.length > 0 && (
        <JsonLd data={buildItemList("Today's picks: award-winning films", "/picks", picks.map((pick) => pick.film))} />
      )}
      <main>
        <PicksPageView serverPicks={picks} dateLabel={formatPicksDate(now)} />
      </main>
    </div>
  );
}
