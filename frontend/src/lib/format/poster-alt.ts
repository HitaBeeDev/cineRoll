type PosterFilm = {
  title: string;
  year?: number | null;
  releaseYear?: number | null;
  oscarWins?: number;
  ggWins?: number;
  cannesWins?: number;
  berlinWins?: number;
  oscarNominations?: number;
  ggNominations?: number;
  cannesNominations?: number;
  berlinNominations?: number;
};

const BODIES = [
  { wins: "oscarWins", noms: "oscarNominations", name: "Oscar" },
  { wins: "ggWins", noms: "ggNominations", name: "Golden Globe" },
  { wins: "cannesWins", noms: "cannesNominations", name: "Cannes" },
  { wins: "berlinWins", noms: "berlinNominations", name: "Berlinale" },
] as const;

/**
 * Poster alt text that says which film it is and why it is here:
 * "Parasite (2019) poster, 4 Oscar wins and 1 Cannes win". `context` overrides
 * the award part when the page knows more ("Palme d'Or winner").
 */
export function posterAlt(film: PosterFilm, context?: string): string {
  const year = film.year ?? film.releaseYear;
  const name = year ? `${film.title} (${year}) poster` : `${film.title} poster`;
  if (context) return `${name}, ${context}`;

  const wins = BODIES.map((body) => ({ name: body.name, count: film[body.wins] ?? 0 }))
    .filter((body) => body.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)
    .map((body) => `${body.count} ${body.name} ${body.count === 1 ? "win" : "wins"}`);
  if (wins.length > 0) return `${name}, ${wins.join(" and ")}`;

  const nominated = BODIES.find((body) => (film[body.noms] ?? 0) > 0);
  return nominated ? `${name}, ${nominated.name} nominee` : name;
}
