import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const ENV_FILE = path.resolve(__dirname, '../../.env');
const ENV_LOCAL_FILE = path.resolve(__dirname, '../../.env.local');

function readEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  return dotenv.parse(fs.readFileSync(filePath));
}

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  return values.find(value => value?.trim());
}

const env = {
  base: readEnvFile(ENV_FILE),
  local: readEnvFile(ENV_LOCAL_FILE),
};

const TMDB_KEY = firstNonEmpty(process.env.TMDB_API_KEY, env.local.TMDB_API_KEY, env.base.TMDB_API_KEY);
const OMDB_KEY = firstNonEmpty(process.env.OMDB_API_KEY, env.local.OMDB_API_KEY, env.base.OMDB_API_KEY);
const TMDB_BASE = 'https://api.themoviedb.org/3';
const OMDB_BASE = 'https://www.omdbapi.com';

const DATA_DIR = path.resolve(__dirname, '../../data');
const OSCAR_CSV = path.join(DATA_DIR, 'films-oscar.csv');
const GG_CSV = path.join(DATA_DIR, 'films-goldenglobe.csv');
const ENRICHED_JSON = path.join(DATA_DIR, 'films-enriched.json');
const ERRORS_CSV = path.join(DATA_DIR, 'enrichment-errors.csv');

// CSV row shape: Id, Award Year, OSCie Name, Release Year, Type Of Award, Award Winner, Award Nominee
interface CsvRow {
  'Id': string;
  'Award Year': string;
  'OSCie Name': string;
  'Release Year': string;
  'Type Of Award': string;
  'Award Winner': string;
  'Award Nominee': string;
}

interface AwardRecord {
  awardYear: number;
  category: string;
  nominee: string;
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
  oscarCategories: AwardRecord[];
  ggNominations: number;
  ggWins: number;
  ggCategories: AwardRecord[];
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

function parseCsv(filePath: string): CsvRow[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return parse(raw, { columns: true, skip_empty_lines: true, trim: true }) as CsvRow[];
}

function filmTitle(row: CsvRow): string {
  return row['OSCie Name'];
}

function rowToAwardRecord(row: CsvRow): AwardRecord {
  const winner = row['Award Winner']?.trim();
  const won = !!winner && winner !== 'NaN' && winner !== '';
  return {
    awardYear: parseInt(row['Award Year'], 10),
    category: row['Type Of Award'],
    nominee: row['Award Nominee'] ?? '',
    won,
  };
}

async function tmdbSearch(title: string, year: string): Promise<number | null> {
  const url = `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}&year=${year}&language=en-US`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB search failed: ${res.status} ${res.statusText}`);
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
  if (!res.ok) throw new Error(`TMDB details failed: ${res.status} ${res.statusText}`);
  return res.json() as Promise<Record<string, unknown>>;
}

async function omdbDetails(imdbId: string): Promise<Record<string, unknown>> {
  const url = `${OMDB_BASE}/?i=${imdbId}&apikey=${OMDB_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OMDB lookup failed: ${res.status} ${res.statusText}`);

  const data = await res.json() as Record<string, unknown>;
  if (data.Response === 'False') {
    const message = typeof data.Error === 'string' ? data.Error : 'Unknown OMDB error';
    throw new Error(`OMDB lookup failed: ${message}`);
  }

  return data;
}

async function main() {
  if (!TMDB_KEY || !OMDB_KEY) {
    console.error('Missing API keys — fill in TMDB_API_KEY and OMDB_API_KEY in backend/.env.local');
    process.exit(1);
  }

  if (!fs.existsSync(OSCAR_CSV)) {
    console.error(`CSV not found: ${OSCAR_CSV}`);
    process.exit(1);
  }
  if (!fs.existsSync(GG_CSV)) {
    console.error(`CSV not found: ${GG_CSV}`);
    process.exit(1);
  }

  const oscarRows = parseCsv(OSCAR_CSV);
  const ggRows = parseCsv(GG_CSV);
  console.log(`Loaded ${oscarRows.length} Oscar rows, ${ggRows.length} Golden Globe rows\n`);

  // Group rows by (title + release year)
  type FilmKey = string;
  const oscarMap = new Map<FilmKey, CsvRow[]>();
  const ggMap = new Map<FilmKey, CsvRow[]>();

  for (const row of oscarRows) {
    const key = `${filmTitle(row).toLowerCase().trim()}|${row['Release Year'].trim()}`;
    const existing = oscarMap.get(key) ?? [];
    existing.push(row);
    oscarMap.set(key, existing);
  }

  for (const row of ggRows) {
    const key = `${filmTitle(row).toLowerCase().trim()}|${row['Release Year'].trim()}`;
    const existing = ggMap.get(key) ?? [];
    existing.push(row);
    ggMap.set(key, existing);
  }

  // Collect unique films across both CSVs
  const allKeys = new Set<FilmKey>([...oscarMap.keys(), ...ggMap.keys()]);
  const uniqueFilms: Array<{ title: string; year: string }> = [];
  for (const key of allKeys) {
    const [titleLower, year] = key.split('|');
    // Get original-casing title from first row
    const sampleRow = oscarMap.get(key)?.[0] ?? ggMap.get(key)?.[0];
    const title = sampleRow ? filmTitle(sampleRow) : (titleLower ?? '');
    if (title && year) uniqueFilms.push({ title, year });
  }

  console.log(`Unique films to enrich: ${uniqueFilms.length}\n`);

  const enriched: EnrichedFilm[] = [];
  const errors: ErrorRow[] = [];
  const usedSlugs = new Set<string>();

  let i = 0;
  for (const { title, year } of uniqueFilms) {
    i++;
    const key = `${title.toLowerCase().trim()}|${year.trim()}`;
    console.log(`[${i}/${uniqueFilms.length}] ${title} (${year})`);

    try {
      await delay(250);
      const tmdbId = await tmdbSearch(title, year);

      if (!tmdbId) {
        errors.push({ title, year, reason: 'No TMDB match found' });
        console.log('  ✗ No TMDB match');
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

      const oscarRecords = (oscarMap.get(key) ?? []).map(rowToAwardRecord);
      const ggRecords = (ggMap.get(key) ?? []).map(rowToAwardRecord);

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
        language: (details.original_language as string | null | undefined) ?? null,
        posterUrl: posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null,
        backdropUrl: backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : null,
        trailerUrl,
        imdbRating,
        rtScore,
        oscarNominations: oscarRecords.length,
        oscarWins: oscarRecords.filter(r => r.won).length,
        oscarCategories: oscarRecords,
        ggNominations: ggRecords.length,
        ggWins: ggRecords.filter(r => r.won).length,
        ggCategories: ggRecords,
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
  } else if (fs.existsSync(ERRORS_CSV)) {
    fs.unlinkSync(ERRORS_CSV);
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
