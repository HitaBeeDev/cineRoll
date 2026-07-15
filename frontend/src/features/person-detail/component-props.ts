import type { AwardBody, FilmRow, PersonData } from "./domain-types";

export type PersonProps = { person: PersonData };
export type PersonHeroProps = PersonProps & { avatarHue: number };
export type PersonAvatarProps = PersonHeroProps & { initials: string };
export type PersonInfoProps = PersonProps;
export type AwardBodyCardProps = { body: AwardBody };
export type AwardHistoryProps = { awardBodies: AwardBody[] };
export type FilmPosterCardProps = { film: FilmRow };
export type FilmographyProps = { films: FilmRow[] };

export type PersonStatProps = {
  accent: boolean;
  label: string;
  value: number;
};
