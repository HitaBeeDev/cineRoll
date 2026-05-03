import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const SEARCH_THRESHOLD_MS = 100;
const DETAIL_THRESHOLD_MS = 50;

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
  throw new Error("Missing required env var: DATABASE_URL");
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: parseInt(process.env["DATABASE_POOL_SIZE"] ?? "25", 10),
});

type TimedQuery = {
  name: string;
  thresholdMs: number;
  sql: string;
  params: unknown[];
};

async function timedQuery({ name, thresholdMs, sql, params }: TimedQuery) {
  const start = performance.now();
  await pool.query(sql, params);
  const elapsedMs = performance.now() - start;
  const status = elapsedMs <= thresholdMs ? "PASS" : "FAIL";
  console.log(`${status} ${name}: ${elapsedMs.toFixed(1)}ms (target < ${thresholdMs}ms)`);

  return elapsedMs <= thresholdMs;
}

async function main() {
  const sample = await pool.query<{ slug: string; title: string; year: number; genre: string | null }>(
    `
      SELECT slug, title, year, genres[1] AS genre
      FROM "Film"
      WHERE array_length(genres, 1) > 0
      ORDER BY "createdAt" DESC
      LIMIT 1
    `,
  );

  const film = sample.rows[0];
  if (!film) {
    throw new Error("No films found. Seed the database before running performance checks.");
  }

  const decadeStart = Math.floor(film.year / 10) * 10;
  const decadeEnd = decadeStart + 9;

  const checks: TimedQuery[] = [
    {
      name: "trigram title search",
      thresholdMs: SEARCH_THRESHOLD_MS,
      sql: `
        SELECT id, title, year
        FROM "Film"
        WHERE title % $1::TEXT OR title ILIKE $2::TEXT
        ORDER BY similarity(title, $1::TEXT) DESC, title ASC
        LIMIT 12
      `,
      params: [film.title, `%${film.title}%`],
    },
    {
      name: "decade filter",
      thresholdMs: SEARCH_THRESHOLD_MS,
      sql: `
        SELECT id, title, year
        FROM "Film"
        WHERE year BETWEEN $1 AND $2
        ORDER BY year DESC, title ASC
        LIMIT 12
      `,
      params: [decadeStart, decadeEnd],
    },
    {
      name: "genre filter",
      thresholdMs: SEARCH_THRESHOLD_MS,
      sql: `
        SELECT id, title, genres
        FROM "Film"
        WHERE genres @> ARRAY[$1]::TEXT[]
        ORDER BY title ASC
        LIMIT 12
      `,
      params: [film.genre],
    },
    {
      name: "slug detail lookup",
      thresholdMs: DETAIL_THRESHOLD_MS,
      sql: `
        SELECT *
        FROM "Film"
        WHERE slug = $1
        LIMIT 1
      `,
      params: [film.slug],
    },
  ];

  const results: boolean[] = [];
  for (const check of checks) {
    results.push(await timedQuery(check));
  }

  const failed = results.some(result => !result);

  await pool.end();

  if (failed) {
    process.exitCode = 1;
  }
}

main().catch(async error => {
  await pool.end();
  console.error(error);
  process.exit(1);
});
