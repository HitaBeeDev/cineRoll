import type { ProfileSummary, RecommendationsResult } from "./domain-types";
import type { ProfileNavigationItem } from "./profile-navigation-item";

export type ProfileIdentityProps = {
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
};

export type ProfileStatProps = {
  label: string;
  value: number;
};

export type FavoriteGenresProps = {
  genres: string[];
};

export type ProfileStatsProps = {
  summary: ProfileSummary;
};

export type ProfileNavigationCardProps = {
  item: ProfileNavigationItem;
};

export type ProfileRecommendationsProps = {
  recommendationsPromise: Promise<RecommendationsResult>;
};
