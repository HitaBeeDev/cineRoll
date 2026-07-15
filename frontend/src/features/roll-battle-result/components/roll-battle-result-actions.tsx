import Link from "next/link";
import { ShareButton } from "@/components/share-button";
import { buildRollBattleCaption } from "../build-roll-caption";
import { ROLL_BATTLE_SECONDARY_ACTION_CLASS } from "../component-class-names";
import type { RollBattleResultActionsProps } from "../component-props";
import { ROLL_BATTLE_RESULT_SITE_URL } from "../config";

export function RollBattleResultActions({ film }: RollBattleResultActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link
        href={`/film/${film.slug}`}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#e8453c] py-3.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b]"
      >
        Watch This Tonight
      </Link>
      <ShareButton
        url={`${ROLL_BATTLE_RESULT_SITE_URL}/film/${film.slug}`}
        title={`Roll Battle picked ${film.title} — CineRoll`}
        caption={buildRollBattleCaption(film)}
        className={ROLL_BATTLE_SECONDARY_ACTION_CLASS}
      />
      <Link
        href="/roll-battle"
        className={ROLL_BATTLE_SECONDARY_ACTION_CLASS}
      >
        Play Roll Battle
      </Link>
    </div>
  );
}
