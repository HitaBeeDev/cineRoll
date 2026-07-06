import { CaseFile } from "./case-file/case-file";
import { SuspectLineup } from "./lineup/suspect-lineup";
import { useBlindRollGame } from "./use-blind-roll-game";
import { VaultPanel } from "./vault/vault-panel";

type RoundLayoutProps = {
  game: ReturnType<typeof useBlindRollGame>;
  reduced: boolean;
};

export function RoundLayout({ game, reduced }: RoundLayoutProps) {
  if (!game.film) return null;

  return (
    <div className="relative grid flex-1 items-stretch gap-3 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-2 lg:min-h-0">
        <CaseFile
          awards={game.awards}
          awardSummary={game.awardSummary}
          clueCards={game.clueCards}
          expandedAward={game.expandedAward}
          examinedAwards={game.examinedAwards}
          onExamineAward={game.examineAward}
        />
        <SuspectLineup
          film={game.film}
          options={game.options}
          phase={game.phase}
          correct={game.correct}
          selectedFilmId={game.selectedFilmId}
          reduced={reduced}
          onSelect={game.setSelectedFilmId}
        />
      </div>
      <VaultPanel
        film={game.film}
        phase={game.phase}
        correct={game.correct}
        selectedFilm={game.selectedFilm}
        selectedFilmId={game.selectedFilmId}
        examinedCount={game.examinedAwards.size}
        awardCount={game.awards.length}
        shareStatus={game.shareStatus}
        reduced={reduced}
        onReveal={game.reveal}
        onChallengeFriend={() => void game.challengeFriend()}
        onNextFilm={() => void game.loadFilm()}
      />
    </div>
  );
}
