import type { Metadata } from "next";
import { StatsPageShell } from "@/features/stats/components/stats-page-shell";
import { fetchStats } from "@/features/stats/stats-repository";

export const metadata: Metadata = {
  title: "Award Film Stats & Records",
  description: "Discover the most nominated and award-winning films and people across the Oscars, Golden Globes, Cannes, and the Berlinale. Explore CineRoll's full award film dataset by the numbers.",
};

// 90 days — stats only change on a seed. Was force-dynamic, which woke the
// backend and database on every single visit.
export const revalidate = 7776000;

export default async function StatsPage() {
  const stats = await fetchStats();
  // Throw rather than cache an empty page for 90 days; a failed rebuild keeps
  // serving the last good version.
  if (!stats) throw new Error("stats: API unavailable");
  return <StatsPageShell stats={stats} />;
}
