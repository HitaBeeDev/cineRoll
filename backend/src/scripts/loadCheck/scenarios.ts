import type { Scenario } from "./types";

export const SCENARIOS: Scenario[] = [
  { name: "random", path: "/api/random", targetMs: 200 },
  { name: "browse", path: "/api/films?sort=rating&page=1&limit=12", targetMs: 200 },
  { name: "browse+filter", path: "/api/films?awardBody=oscar&genre=Drama&sort=rating&limit=12", targetMs: 200 },
  { name: "recommendations (warm)", path: "/api/recommendations?limit=6", targetMs: 150, auth: true },
];
