import type { Metadata } from "next";
import { StatsPageShell } from "@/features/stats/components/stats-page-shell";
import { fetchStats } from "@/features/stats/stats-repository";

export const metadata: Metadata = {
  title: "Award Film Stats & Records",
  description: "Discover the most nominated and award-winning films and people across the Oscars, Golden Globes, Cannes, and the Berlinale. Explore CineRoll's full award film dataset by the numbers.",
};

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const stats = await fetchStats();
  return <StatsPageShell stats={stats} />;
}
