import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const TMDB_KEY = process.env.TMDB_API_KEY;
const OMDB_KEY = process.env.OMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const OMDB_BASE = 'https://www.omdbapi.com';

const DATA_DIR = path.resolve(__dirname, '../../data');
const RAW_CSV = path.join(DATA_DIR, 'films-raw.csv');
const ENRICHED_JSON = path.join(DATA_DIR, 'films-enriched.json');
const ERRORS_CSV = path.join(DATA_DIR, 'enrichment-errors.csv');

interface RawFilm {
  title: string;
  year: string;
  language?: string;
  oscarNominations?: string;
  oscarWins?: string;
  oscarCategories?: string;
  ggNominations?: string;
  ggWins?: string;
  ggCategories?: string;
}

interface AwardCategory {
  category: string;
  year: number;
  won: boolean;
}

interface EnrichedFilm {
  slug: string;
  tmdbId: number;
  imdbId: string | null;
  title: string;
  year: number;
  runtime: number | null;
  genres: string[];
  plot: string | null;
  director: string | null;
  cast: string[];
  language: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  trailerUrl: string | null;
  imdbRating: number | null;
  rtScore: number | null;
  oscarNominations: number;
  oscarWins: number;
  oscarCategories: AwardCategory[];
  ggNominations: number;
  ggWins: number;
  ggCategories: AwardCategory[];
  isPickOfDay: boolean;
  pickOfDayDate: string | null;
}

interface ErrorRow {
  title: string;
  year: string;
  reason: string;
}

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function tmdbSearch(title: string, year: string): Promise<number | null> {
  const url = `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}&year=${year}&language=en-US`;
  const res = await fetch(url);
  const data = (await res.json()) as { results?: Array<{ id: number; release_date?: string }> };
  if (!data.results?.length) return null;
  const exact = data.results.find(r => r.release_date?.startsWith(year));
  const first = data.results[0];
  if (!first) return null;
  return (exact ?? first).id;
}

async function tmdbDetails(tmdbId: number): Promise<Record<string, unknown>> {
  const url = `${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_KEY}&append_to_response=credits,videos`;
  const res = await fetch(url);
  return res.json() as Promise<Record<string, unknown>>;
}

async function omdbDetails(imdbId: string): Promise<Record<string, unknown>> {
  const url = `${OMDB_BASE}/?i=${imdbId}&apikey=${OMDB_KEY}`;
  const res = await fetch(url);
  return res.json() as Promise<Record<string, unknown>>;
}

function parseAwardCategories(raw: string | undefined): AwardCategory[] {
  if (!raw?.trim()) return [];
  try {
    return JSON.parse(raw) as AwardCategory[];
  } catch {
    return [];
  }
}

async function main() {
  if (!TMDB_KEY || !OMDB_KEY) {
    console.error('Missing API keys — fill in TMDB_API_KEY and OMDB_API_KEY in backend/.env.local');
    process.exit(1);
  }

  if (!fs.existsSync(RAW_CSV)) {
    console.error(`films-raw.csv not found at ${RAW_CSV}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(RAW_CSV, 'utf-8');
  const films = parse(raw, { columns: true, skip_empty_lines: true, trim: true }) as RawFilm[];
  console.log(`Loaded ${films.length} films from films-raw.csv\n`);

  const enriched: EnrichedFilm[] = [];
  const errors: ErrorRow[] = [];
  const usedSlugs = new Set<string>();

  let i = 0;
  for (const film of films) {
    i++;
    const { title, year } = film;
    console.log(`[${i}/${films.length}] ${title} (${year})`);

    try {
      await delay(250);
      const tmdbId = await tmdbSearch(title, year);

      if (!tmdbId) {
        errors.push({ title, year, reason: 'No TMDB match found' });
        console.log(`  ✗ No TMDB match`);
        continue;
      }

      await delay(250);
      const details = await tmdbDetails(tmdbId);

      const crew = (details.credits as { crew?: Array<{ job: string; name: string }> })?.crew ?? [];
      const castRaw = (details.credits as { cast?: Array<{ name: string }> })?.cast ?? [];
      const videos = (details.videos as { results?: Array<{ type: string; site: string; key: string }> })?.results ?? [];
      const genres = (details.genres as Array<{ name: string }> | undefined) ?? [];

      const director = crew.find(c => c.job === 'Director')?.name ?? null;
      const cast = castRaw.slice(0, 10).map(c => c.name);

      const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

      const imdbId = (details.imdb_id as string | null | undefined) ?? null;
      let imdbRating: number | null = null;
      let rtScore: number | null = null;

      if (imdbId) {
        await delay(250);
        const omdb = await omdbDetails(imdbId);
        const imdbRaw = omdb.imdbRating as string | undefined;
        if (imdbRaw && imdbRaw !== 'N/A') imdbRating = parseFloat(imdbRaw);
        const ratings = omdb.Ratings as Array<{ Source: string; Value: string }> | undefined;
        const rtRaw = ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value;
        if (rtRaw) rtScore = parseInt(rtRaw.replace('%', ''), 10);
      }

      let slug = slugify(title);
      if (usedSlugs.has(slug)) slug = `${slug}-${year}`;
      usedSlugs.add(slug);

      const posterPath = details.poster_path as string | null | undefined;
      const backdropPath = details.backdrop_path as string | null | undefined;

      enriched.push({
        slug,
        tmdbId,
        imdbId,
        title,
        year: parseInt(year, 10),
        runtime: (details.runtime as number | null | undefined) ?? null,
        genres: genres.map(g => g.name),
        plot: (details.overview as string | null | undefined) ?? null,
        director,
        cast,
        language: film.language ?? (details.original_language as string | null | undefined) ?? null,
        posterUrl: posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null,
        backdropUrl: backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : null,
        trailerUrl,
        imdbRating,
        rtScore,
        oscarNominations: parseInt(film.oscarNominations ?? '0', 10),
        oscarWins: parseInt(film.oscarWins ?? '0', 10),
        oscarCategories: parseAwardCategories(film.oscarCategories),
        ggNominations: parseInt(film.ggNominations ?? '0', 10),
        ggWins: parseInt(film.ggWins ?? '0', 10),
        ggCategories: parseAwardCategories(film.ggCategories),
        isPickOfDay: false,
        pickOfDayDate: null,
      });

      console.log(`  ✓ Done (tmdbId=${tmdbId}${imdbId ? `, imdb=${imdbId}` : ''})`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ title, year, reason: msg });
      console.error(`  ✗ Error: ${msg}`);
    }
  }

  fs.writeFileSync(ENRICHED_JSON, JSON.stringify(enriched, null, 2), 'utf-8');

  if (errors.length > 0) {
    const errorsCsv = stringify(errors, { header: true, columns: ['title', 'year', 'reason'] });
    fs.writeFileSync(ERRORS_CSV, errorsCsv, 'utf-8');
  }

  console.log('\n--- Summary ---');
  console.log(`Enriched : ${enriched.length}`);
  console.log(`Errors   : ${errors.length}`);
  console.log(`Output   : ${ENRICHED_JSON}`);
  if (errors.length > 0) console.log(`Error log: ${ERRORS_CSV}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
