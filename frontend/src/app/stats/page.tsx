import type { Metadata } from "next";
import { StatsPageShell } from "@/features/stats/components/stats-page-shell";
import { fetchStats } from "@/features/stats/stats-repository";

export const metadata: Metadata = {
  alternates: { canonical: "/stats" },
  title: "Award Film Stats & Records",
  description: "The most nominated and most awarded films and people at the Oscars, Golden Globes, Cannes and the Berlinale — CineRoll's award data by the numbers.",
};

// Rendered per request so a backend outage never fails the build or caches the
// "unavailable" state. The API call itself is cached for 90 days (see
// fetchStats), so visits no longer wake the backend and database.
export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const stats = await fetchStats();
  return <StatsPageShell stats={stats} />;
}
