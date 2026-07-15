export type RollBattleResultSearchParams = {
  film?: string;
};

export type RollBattleResultPageProps = {
  searchParams: Promise<RollBattleResultSearchParams>;
};
