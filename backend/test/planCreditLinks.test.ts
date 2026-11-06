import { describe, expect, it } from "vitest";

import { planCreditLinks, type PlanCredit, type PlanFilm } from "../src/lib/people/planCreditLinks";

const credit = (nominee: string, category: string, over: Partial<PlanCredit> = {}): PlanCredit => ({
  body: "oscar", awardYear: 2020, category, won: false, nominee, ...over,
});
const film = (over: Partial<PlanFilm>): PlanFilm => ({
  id: "f1", slug: "parasite-2019", title: "Parasite", director: null, credits: [], tmdbCredits: [], ...over,
});
const personFor = (plan: ReturnType<typeof planCreditLinks>, key: string) => plan.persons.find(p => p.key === key);

describe("planCreditLinks", () => {
  it("verifies a credited name found in the film's own TMDB credits, even in another word order", () => {
    const plan = planCreditLinks(
      [film({
        director: "Bong Joon Ho",
        credits: [credit("Bong Joon Ho, Han Jin Won", "Writing (Original Screenplay)", { won: true })],
        tmdbCredits: [{ id: 21684, name: "Bong Joon-ho" }, { id: 1, name: "Han Jin-won" }],
      })],
      [],
      [],
    );
    const bong = personFor(plan, "tmdb:21684");
    expect(bong).toMatchObject({ slug: "bong-joon-ho", status: "verified", tmdbPersonId: 21684 });
    expect(plan.credits[0]?.people.map(link => link.personKey)).toEqual(["tmdb:21684", "tmdb:1"]);
    expect(plan.directors).toEqual([{ filmId: "f1", personKey: "tmdb:21684" }]);
    expect(plan.review).toEqual([]);
  });

  it("splits co-directors into separate people", () => {
    const plan = planCreditLinks(
      [film({ id: "f2", slug: "fargo-1996", title: "Fargo", director: "Joel Coen, Ethan Coen", tmdbCredits: [{ id: 1223, name: "Joel Coen" }, { id: 1224, name: "Ethan Coen" }] })],
      [],
      [],
    );
    expect(plan.directors.map(d => d.personKey)).toEqual(["tmdb:1223", "tmdb:1224"]);
  });

  it("applies hand decisions over everything else", () => {
    const plan = planCreditLinks(
      [film({ credits: [credit("Metro Jones", "Writing"), credit("Special Thanks Team", "Writing")] })],
      [{ name: "Metro Jones", tmdbPersonId: 99 }, { name: "Special Thanks Team", notAPerson: true }],
      [],
    );
    expect(plan.credits[0]?.people).toEqual([{ personKey: "tmdb:99", position: 0, matchedBy: "override" }]);
    expect(plan.credits[1]?.people).toEqual([]);
    expect(plan.review).toEqual([]);
  });

  it("links a name TMDB doesn't list for this film to the one verified person with that spelling, and lists it for review", () => {
    const plan = planCreditLinks(
      [
        film({ id: "a", slug: "a", title: "A", credits: [credit("John Williams", "Music (Original Score)")], tmdbCredits: [{ id: 491, name: "John Williams" }] }),
        film({ id: "b", slug: "b", title: "B", credits: [credit("John Williams", "Music (Original Score)")], tmdbCredits: [] }),
      ],
      [],
      [],
    );
    expect(plan.credits[1]?.people).toEqual([{ personKey: "tmdb:491", position: 0, matchedBy: "name" }]);
    expect(plan.review).toHaveLength(1);
    expect(plan.review[0]?.reason).toMatch(/linked by name only/);
  });

  it("keeps an unmatched name as an unverified person with review candidates", () => {
    const plan = planCreditLinks(
      [film({ credits: [credit("Leonard Rosenman", "Music")], tmdbCredits: [{ id: 7, name: "Leonard Bernstein" }, { id: 8, name: "Somebody Else" }] })],
      [],
      [],
    );
    expect(personFor(plan, "name:leonard-rosenman")).toMatchObject({ status: "unverified", tmdbPersonId: null });
    expect(plan.review[0]?.candidates).toBe("Leonard Bernstein (#7)");
  });

  it("keeps an existing person's id and slug, and turns other spellings into aliases", () => {
    const plan = planCreditLinks(
      [film({
        credits: [credit("Pedro ALMODÓVAR", "Directing"), credit("Pedro Almodóvar Caballero", "Writing")],
        tmdbCredits: [{ id: 309, name: "Pedro Almodóvar" }],
      })],
      [{ name: "Pedro Almodóvar Caballero", tmdbPersonId: 309 }],
      [{ id: "p1", slug: "pedro-almodovar", name: "Pedro Almodóvar", tmdbPersonId: 309 }],
    );
    expect(personFor(plan, "tmdb:309")).toMatchObject({
      existingId: "p1",
      slug: "pedro-almodovar",
      aliases: ["pedro-almodovar-caballero"],
    });
  });

  it("gives the second of two different people with one name a distinct slug", () => {
    const plan = planCreditLinks(
      [
        film({ id: "a", slug: "a", title: "A", credits: [credit("John Smith", "Writing"), credit("John Smith", "Writing", { awardYear: 2021 })], tmdbCredits: [{ id: 1, name: "John Smith" }] }),
        film({ id: "b", slug: "b", title: "B", credits: [credit("John Smith", "Editing")], tmdbCredits: [{ id: 2, name: "John Smith" }] }),
      ],
      [],
      [],
    );
    expect(personFor(plan, "tmdb:1")?.slug).toBe("john-smith");
    expect(personFor(plan, "tmdb:2")?.slug).toBe("john-smith-2");
  });

  it("never hands out a slug another existing person row already owns", () => {
    const plan = planCreditLinks(
      [film({ credits: [credit("John Smith", "Writing")], tmdbCredits: [{ id: 5, name: "John Smith" }] })],
      [],
      [{ id: "old", slug: "john-smith", name: "John Smith", tmdbPersonId: 4 }],
    );
    expect(personFor(plan, "tmdb:5")).toMatchObject({ existingId: null, slug: "john-smith-5" });
  });

  // Two verified Jane Does (TMDB 9 and 11) plus a name-only one on a film with no
  // TMDB credits: the name-only one can't pick between them, so stays unverified.
  const threeJanes = [
    film({ id: "a", slug: "a", title: "A", credits: [credit("Jane Doe", "Writing"), credit("Jane Doe", "Writing", { awardYear: 2021 })], tmdbCredits: [{ id: 9, name: "Jane Doe" }] }),
    film({ id: "b", slug: "b", title: "B", credits: [credit("Jane Doe", "Editing")], tmdbCredits: [{ id: 11, name: "Jane Doe" }] }),
    film({ id: "c", slug: "c", title: "C", credits: [credit("Jane Doe", "Sound")], tmdbCredits: [] }),
  ];

  it("never hands out a clash slug another existing person row already owns", () => {
    const plan = planCreditLinks(threeJanes, [], [
      { id: "v9", slug: "jane-doe", name: "Jane Doe", tmdbPersonId: 9 },
      { id: "v11", slug: "jane-doe-11", name: "Jane Doe", tmdbPersonId: 11 },
      // Someone not in this plan at all already holds jane-doe-2.
      { id: "other", slug: "jane-doe-2", name: "Jane Doe", tmdbPersonId: 12 },
    ]);
    const slugs = plan.persons.map(p => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(personFor(plan, "name:jane-doe")?.slug).not.toBe("jane-doe-2");
  });

  it("reuses an unverified person's own earlier row and slug instead of making a new one each run", () => {
    const plan = planCreditLinks(threeJanes, [], [
      { id: "v9", slug: "jane-doe", name: "Jane Doe", tmdbPersonId: 9 },
      { id: "v11", slug: "jane-doe-11", name: "Jane Doe", tmdbPersonId: 11 },
      { id: "earlier", slug: "jane-doe-7", name: "Jane Doe", tmdbPersonId: null },
    ]);
    expect(personFor(plan, "name:jane-doe")).toMatchObject({ existingId: "earlier", slug: "jane-doe-7" });
  });

  it("lets a hand-marked primary keep the plain slug, and prefers verified over unverified", () => {
    const plan = planCreditLinks(
      [
        film({ id: "a", slug: "a", title: "A", credits: [credit("Steve McQueen", "Directing"), credit("Steve McQueen", "Best Picture")], tmdbCredits: [{ id: 72757, name: "Steve McQueen" }] }),
        film({ id: "b", slug: "b", title: "B", credits: [credit("Steve McQueen", "Actor")], tmdbCredits: [{ id: 13565, name: "Steve McQueen" }] }),
        film({ id: "c", slug: "c", title: "C", credits: [credit("Jack Whitney", "Sound"), credit("Jack Whitney", "Sound", { awardYear: 2021 })], tmdbCredits: [] }),
        film({ id: "d", slug: "d", title: "D", credits: [credit("Jack Whitney", "Sound")], tmdbCredits: [{ id: 1529487, name: "Jack Whitney" }] }),
      ],
      [{ name: "Steve McQueen", film: "b", tmdbPersonId: 13565, primary: true }],
      [],
    );
    expect(personFor(plan, "tmdb:13565")?.slug).toBe("steve-mcqueen");
    expect(personFor(plan, "tmdb:72757")?.slug).toBe("steve-mcqueen-72757");
    // Name-only "Jack Whitney" links to the one verified Jack Whitney instead of competing for the slug.
    expect(personFor(plan, "tmdb:1529487")?.slug).toBe("jack-whitney");
  });
});
