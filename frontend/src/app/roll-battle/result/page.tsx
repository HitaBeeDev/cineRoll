import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { buildRollBattleResultMetadata } from "@/features/roll-battle-result/build-result-metadata";
import { RollBattleResultActions } from "@/features/roll-battle-result/components/roll-battle-result-actions";
import { RollBattleWinnerCard } from "@/features/roll-battle-result/components/roll-battle-winner-card";
import { RollBattleWinnerHeading } from "@/features/roll-battle-result/components/roll-battle-winner-heading";
import type { RollBattleResultPageProps } from "@/features/roll-battle-result/domain-types";
import { ROLL_BATTLE_RESULT_FALLBACK_METADATA } from "@/features/roll-battle-result/fallback-metadata";
import { fetchRollBattleWinner } from "@/features/roll-battle-result/roll-battle-result-repository";

export async function generateMetadata({
  searchParams,
}: RollBattleResultPageProps): Promise<Metadata> {
  const { film: slug } = await searchParams;
  if (!slug) return ROLL_BATTLE_RESULT_FALLBACK_METADATA;

  const film = await fetchRollBattleWinner(slug);
  return film
    ? buildRollBattleResultMetadata(film)
    : ROLL_BATTLE_RESULT_FALLBACK_METADATA;
}

export default async function RollBattleResultPage({
  searchParams,
}: RollBattleResultPageProps) {
  const { film: slug } = await searchParams;
  if (!slug) notFound();

  const film = await fetchRollBattleWinner(slug);
  if (!film) notFound();

  return (
    <div className="flex min-h-dvh flex-col bg-[#09090f]">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <RollBattleWinnerHeading film={film} />
        <RollBattleWinnerCard film={film} />
        <RollBattleResultActions film={film} />
      </main>
    </div>
  );
}
