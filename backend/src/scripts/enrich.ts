import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as xlsx from 'xlsx';
import { stringify } from 'csv-stringify/sync';
import sharp from 'sharp';
import { Vibrant } from 'node-vibrant/node';

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
const SOURCE_DATA_DIR = path.join(DATA_DIR, 'movie excel datas');
const ENRICHED_JSON = path.join(DATA_DIR, 'films-enriched.json');
const ERRORS_CSV = path.join(DATA_DIR, 'enrichment-errors.csv');

type AwardBody = 'oscar' | 'goldenglobe' | 'cannes';
type FileType = 'award' | 'imdb-movies' | 'imdb-tv' | 'unknown';

interface AwardRow {
  id: string;
  awardBody: AwardBody;
  awardYear: number;
  movieName: string;
  releaseYear: number;
  category: string;
  awardWinner: string;
  awardNominee: string;
  sourceFile: string;
  sourceSheet: string;
}

interface AwardRecord {
  awardBody: AwardBody;
  awardYear: number;
  category: string;
  nominee: string;
  won: boolean;
}

interface ImdbMovieRow {
  name: string;
  rank: number;
  year: number;
  time: string;
  certificate: string;
  rating: number;
}

interface ImdbTvRow {
  name: string;
  rank: number;
  startYear: number;
  endYear: number | null;
  certificate: string;
  type: string;
  rating: number;
}

interface EnrichedFilm {
  slug: string;
  tmdbId: number;
  imdbId: string | null;
  title: string;
  originalTitle: string | null;
  year: number;
  releaseYear: number;
  runtime: number | null;
  genres: string[];
  contentType: string;
  plot: string | null;
  director: string | null;
  cast: string[];
  language: string | null;
  posterUrl: string | null;
  posterColor: string | null;
  backdropUrl: string | null;
  trailerUrl: string | null;
  imdbRating: number | null;
  rtScore: number | null;
  imdbTopMovieRank: number | null;
  imdbTopTvRank: number | null;
  certificate: string | null;
  tvType: string | null;
  tvStartYear: number | null;
  tvEndYear: number | null;
  oscarNominations: number;
  oscarWins: number;
  oscarCategories: AwardRecord[];
  ggNominations: number;
  ggWins: number;
  ggCategories: AwardRecord[];
  cannesNominations: number;
  cannesWins: number;
  cannesCategories: AwardRecord[];
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

function stringValue(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function numberValue(row: Record<string, unknown>, ...keys: string[]): number | null {
  const value = stringValue(row, ...keys);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function awardBodyFromId(id: string): AwardBody | null {
  const prefix = id.split('-')[0]?.toUpperCase();
  if (prefix === 'OSC') return 'oscar';
  if (prefix === 'GG') return 'goldenglobe';
  if (prefix === 'CN' || prefix === 'CAN') return 'cannes';
  return null;
}

// "2h 22m" → 142, "45m" → 45, "2h" → 120
function parseImdbRuntime(time: string): number | null {
  if (!time) return null;
  const match = time.match(/(?:(\d+)h\s*)?(?:(\d+)m)?/);
  if (!match) return null;
  const hours = parseInt(match[1] ?? '0', 10);
  const minutes = parseInt(match[2] ?? '0', 10);
  const total = hours * 60 + minutes;
  return total > 0 ? total : null;
}

function contentTypeFromImdbTvType(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes('mini')) return 'tv-mini-series';
  return 'tv-series';
}

function detectFileType(filePath: string): FileType {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return 'unknown';
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return 'unknown';
  const rows = xlsx.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
  const headers = ((rows[0] as unknown[]) ?? []).map(h => String(h).toLowerCase().trim());
  if (headers.includes('id') && headers.includes('award year')) return 'award';
  if (headers.includes('rank') && headers.includes('time') && !headers.includes('start_year')) return 'imdb-movies';
  if (headers.includes('rank') && headers.includes('start_year')) return 'imdb-tv';
  return 'unknown';
}

function discoverWorkbookFiles(directory: string): string[] {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const workbookFiles: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      workbookFiles.push(...discoverWorkbookFiles(fullPath));
    } else if (/\.xlsx$/i.test(entry.name) && !entry.name.startsWith('~$')) {
      workbookFiles.push(fullPath);
    }
  }

  return workbookFiles.sort();
}

function parseAwardWorkbook(filePath: string): AwardRow[] {
  const workbook = xlsx.readFile(filePath);
  const rows: AwardRow[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const rawRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: '',
      raw: false,
    });

    for (const rawRow of rawRows) {
      const id = stringValue(rawRow, 'Id');
      if (!id) continue;

      const awardBody = awardBodyFromId(id);
      const awardYear = numberValue(rawRow, 'Award Year');
      const movieName = stringValue(rawRow, 'Movie Name', 'OSCie Name');
      const releaseYear = numberValue(rawRow, 'Release Year');
      const category = stringValue(rawRow, 'Type Of Award');
      const awardWinner = stringValue(rawRow, 'Award Winner');
      const awardNominee = stringValue(rawRow, 'Award Nominee');

      if (!awardBody || awardYear === null || !movieName || releaseYear === null || !category) {
        console.warn(`Skipping invalid award row in ${path.basename(filePath)}:${sheetName} id=${id}`);
        continue;
      }

      rows.push({
        id,
        awardBody,
        awardYear,
        movieName,
        releaseYear,
        category,
        awardWinner,
        awardNominee,
        sourceFile: path.basename(filePath),
        sourceSheet: sheetName,
      });
    }
  }

  return rows;
}

function parseImdbMoviesWorkbook(filePath: string): ImdbMovieRow[] {
  const workbook = xlsx.readFile(filePath);
  const rows: ImdbMovieRow[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const rawRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '', raw: false });

    for (const raw of rawRows) {
      const name = stringValue(raw, 'name');
      const rank = numberValue(raw, 'rank');
      const year = numberValue(raw, 'year');
      const time = stringValue(raw, 'time');
      const certificate = stringValue(raw, 'certificate');
      const rating = numberValue(raw, 'rating');

      if (!name || rank === null || year === null || rating === null) continue;
      rows.push({ name, rank, year, time, certificate, rating });
    }
  }

  return rows;
}

function parseImdbTvWorkbook(filePath: string): ImdbTvRow[] {
  const workbook = xlsx.readFile(filePath);
  const rows: ImdbTvRow[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const rawRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '', raw: false });

    for (const raw of rawRows) {
      const name = stringValue(raw, 'name');
      const rank = numberValue(raw, 'rank');
      const startYear = numberValue(raw, 'start_year');
      const endYear = numberValue(raw, 'end_year');
      const certificate = stringValue(raw, 'certificate');
      const type = stringValue(raw, 'type');
      const rating = numberValue(raw, 'rating');

      if (!name || rank === null || startYear === null || rating === null) continue;
      rows.push({ name, rank, startYear, endYear, certificate, type, rating });
    }
  }

  return rows;
}

function rowToAwardRecord(row: AwardRow): AwardRecord {
  const winner = row.awardWinner.trim();
  const won = !!winner && winner.toLowerCase() !== 'nan';
  return {
    awardBody: row.awardBody,
    awardYear: row.awardYear,
    category: row.category,
    nominee: won ? winner : row.awardNominee,
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

async function tmdbTvSearch(name: string, startYear: number): Promise<number | null> {
  const url = `${TMDB_BASE}/search/tv?api_key=${TMDB_KEY}&query=${encodeURIComponent(name)}&first_air_date_year=${startYear}&language=en-US`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB TV search failed: ${res.status} ${res.statusText}`);
  const data = (await res.json()) as { results?: Array<{ id: number; first_air_date?: string }> };
  if (!data.results?.length) return null;
  const exact = data.results.find(r => r.first_air_date?.startsWith(String(startYear)));
  const first = data.results[0];
  if (!first) return null;
  return (exact ?? first).id;
}

async function tmdbTvDetails(tmdbId: number): Promise<Record<string, unknown>> {
  const url = `${TMDB_BASE}/tv/${tmdbId}?api_key=${TMDB_KEY}&append_to_response=credits,videos,external_ids`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB TV details failed: ${res.status} ${res.statusText}`);
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

async function extractDominantPosterColor(posterUrl: string | null): Promise<string | null> {
  if (!posterUrl) return null;

  try {
    const res = await fetch(posterUrl);
    if (!res.ok) throw new Error(`Poster download failed: ${res.status} ${res.statusText}`);

    const image = Buffer.from(await res.arrayBuffer());
    const preparedImage = await sharp(image)
      .resize(160, 160, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();
    const palette = await Vibrant.from(preparedImage).getPalette();
    const swatch = Object.values(palette)
      .filter(swatch => swatch !== null)
      .sort((a, b) => b.population - a.population)[0];

    return swatch?.hex.toUpperCase() ?? null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`  ! Poster color skipped: ${msg}`);
    return null;
  }
}

function contentTypeFromGenres(genres: string[], runtime: number | null): string {
  const normalized = genres.map(genre => genre.toLowerCase());
  if (normalized.includes('documentary')) return 'documentary';
  if (normalized.includes('animation')) return 'animation';
  if (runtime !== null && runtime <= 40) return 'short';
  return 'movie';
}

function awardRecordsFor(rows: AwardRow[], awardBody: AwardBody): AwardRecord[] {
  return rows.filter(row => row.awardBody === awardBody).map(rowToAwardRecord);
}

function awardRowKey(row: AwardRow): string {
  return [
    row.id,
    row.awardBody,
    row.awardYear,
    row.movieName.toLowerCase(),
    row.releaseYear,
    row.category.toLowerCase(),
    row.awardWinner.toLowerCase(),
    row.awardNominee.toLowerCase(),
  ].join('|');
}

function makeSlug(title: string, year: number | string, usedSlugs: Set<string>): string {
  let slug = slugify(title);
  if (usedSlugs.has(slug)) {
    slug = `${slug}-${year}`;
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${slugify(title)}-${year}-${suffix}`;
      suffix++;
    }
  }
  usedSlugs.add(slug);
  return slug;
}

async function main() {
  if (!TMDB_KEY || !OMDB_KEY) {
    console.error('Missing API keys - fill in TMDB_API_KEY and OMDB_API_KEY in backend/.env.local');
    process.exit(1);
  }

  if (!fs.existsSync(SOURCE_DATA_DIR)) {
    console.error(`Source data directory not found: ${SOURCE_DATA_DIR}`);
    process.exit(1);
  }

  const workbookFiles = discoverWorkbookFiles(SOURCE_DATA_DIR);

  if (workbookFiles.length === 0) {
    console.error(`No Excel files found in ${SOURCE_DATA_DIR}`);
    process.exit(1);
  }

  // Categorize files by type
  const awardFiles: string[] = [];
  const imdbMoviesFiles: string[] = [];
  const imdbTvFiles: string[] = [];

  for (const filePath of workbookFiles) {
    const type = detectFileType(filePath);
    const name = path.basename(filePath);
    if (type === 'award') {
      awardFiles.push(filePath);
      console.log(`Award file: ${name}`);
    } else if (type === 'imdb-movies') {
      imdbMoviesFiles.push(filePath);
      console.log(`IMDB movies file: ${name}`);
    } else if (type === 'imdb-tv') {
      imdbTvFiles.push(filePath);
      console.log(`IMDB TV file: ${name}`);
    } else {
      console.warn(`Unknown file type (skipping): ${name}`);
    }
  }

  // Parse IMDB lookup maps
  const imdbMovieMap = new Map<string, ImdbMovieRow>();
  for (const f of imdbMoviesFiles) {
    for (const row of parseImdbMoviesWorkbook(f)) {
      imdbMovieMap.set(`${row.name.toLowerCase().trim()}|${row.year}`, row);
    }
  }
  console.log(`IMDB movie entries: ${imdbMovieMap.size}`);

  const imdbTvMap = new Map<string, ImdbTvRow>();
  for (const f of imdbTvFiles) {
    for (const row of parseImdbTvWorkbook(f)) {
      imdbTvMap.set(`${row.name.toLowerCase().trim()}|${row.startYear}`, row);
    }
  }
  console.log(`IMDB TV entries: ${imdbTvMap.size}\n`);

  // Parse award rows
  const awardRows: AwardRow[] = [];
  for (const workbookFile of awardFiles) {
    const rows = parseAwardWorkbook(workbookFile);
    awardRows.push(...rows);
    console.log(`Loaded ${rows.length} award rows from ${path.basename(workbookFile)}`);
  }

  const uniqueAwardRows = Array.from(
    new Map(awardRows.map(row => [awardRowKey(row), row])).values(),
  );

  if (uniqueAwardRows.length !== awardRows.length) {
    console.log(`Removed ${awardRows.length - uniqueAwardRows.length} duplicate award rows from overlapping workbooks`);
  }

  const countsByBody = uniqueAwardRows.reduce<Record<AwardBody, number>>(
    (counts, row) => {
      counts[row.awardBody]++;
      return counts;
    },
    { oscar: 0, goldenglobe: 0, cannes: 0 },
  );

  console.log(
    `Total rows: ${uniqueAwardRows.length} (Oscar=${countsByBody.oscar}, Golden Globe=${countsByBody.goldenglobe}, Cannes=${countsByBody.cannes})\n`,
  );

  type FilmKey = string;
  const rowsByFilm = new Map<FilmKey, AwardRow[]>();

  for (const row of uniqueAwardRows) {
    const key = `${row.movieName.toLowerCase().trim()}|${row.releaseYear}`;
    const existing = rowsByFilm.get(key) ?? [];
    existing.push(row);
    rowsByFilm.set(key, existing);
  }

  const uniqueFilms: Array<{ title: string; year: string }> = [];
  for (const [key, rows] of rowsByFilm) {
    const [, year] = key.split('|');
    const sampleRow = rows[0];
    if (sampleRow && year) uniqueFilms.push({ title: sampleRow.movieName, year });
  }

  console.log(`Unique award films to enrich: ${uniqueFilms.length}\n`);

  const enriched: EnrichedFilm[] = [];
  const errors: ErrorRow[] = [];
  const usedSlugs = new Set<string>();
  const enrichedTmdbIds = new Set<number>();

  // ── Phase 1: Enrich award films ──────────────────────────────────────────────
  let i = 0;
  for (const { title, year } of uniqueFilms) {
    i++;
    const key = `${title.toLowerCase().trim()}|${year.trim()}`;
    const filmRows = rowsByFilm.get(key) ?? [];
    console.log(`[${i}/${uniqueFilms.length}] ${title} (${year})`);

    try {
      await delay(250);
      const tmdbId = await tmdbSearch(title, year);

      if (!tmdbId) {
        errors.push({ title, year, reason: 'No TMDB match found' });
        console.log('  x No TMDB match');
        continue;
      }

      await delay(250);
      const details = await tmdbDetails(tmdbId);

      const crew = (details.credits as { crew?: Array<{ job: string; name: string }> })?.crew ?? [];
      const castRaw = (details.credits as { cast?: Array<{ name: string }> })?.cast ?? [];
      const videos = (details.videos as { results?: Array<{ type: string; site: string; key: string }> })?.results ?? [];
      const genres = ((details.genres as Array<{ name: string }> | undefined) ?? []).map(genre => genre.name);

      const director = crew.find(c => c.job === 'Director')?.name ?? null;
      const cast = castRaw.slice(0, 10).map(c => c.name);
      const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
      const runtime = (details.runtime as number | null | undefined) ?? null;
      const originalTitleRaw = (details.original_title as string | null | undefined) ?? null;
      const originalTitle =
        originalTitleRaw && originalTitleRaw.toLowerCase() !== title.toLowerCase()
          ? originalTitleRaw
          : null;

      const imdbId = (details.imdb_id as string | null | undefined) ?? null;
      let imdbRating: number | null = null;
      let rtScore: number | null = null;

      // Check IMDB Top 250 overlay for this film
      const imdbMovieEntry = imdbMovieMap.get(`${title.toLowerCase().trim()}|${parseInt(year, 10)}`);
      if (imdbMovieEntry) {
        // Use IMDB file rating directly — more complete than OMDB
        imdbRating = imdbMovieEntry.rating;
      } else if (imdbId) {
        await delay(250);
        try {
          const omdb = await omdbDetails(imdbId);
          const imdbRaw = omdb.imdbRating as string | undefined;
          if (imdbRaw && imdbRaw !== 'N/A') imdbRating = parseFloat(imdbRaw);
          const ratings = omdb.Ratings as Array<{ Source: string; Value: string }> | undefined;
          const rtRaw = ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value;
          if (rtRaw) rtScore = parseInt(rtRaw.replace('%', ''), 10);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`  ! OMDB skipped: ${msg}`);
        }
      }

      const slug = makeSlug(title, year, usedSlugs);

      const posterPath = details.poster_path as string | null | undefined;
      const backdropPath = details.backdrop_path as string | null | undefined;
      const posterUrl = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;
      const posterColor = await extractDominantPosterColor(posterUrl);

      const oscarRecords = awardRecordsFor(filmRows, 'oscar');
      const ggRecords = awardRecordsFor(filmRows, 'goldenglobe');
      const cannesRecords = awardRecordsFor(filmRows, 'cannes');

      enriched.push({
        slug,
        tmdbId,
        imdbId,
        title,
        originalTitle,
        year: parseInt(year, 10),
        releaseYear: parseInt(year, 10),
        runtime,
        genres,
        contentType: contentTypeFromGenres(genres, runtime),
        plot: (details.overview as string | null | undefined) ?? null,
        director,
        cast,
        language: (details.original_language as string | null | undefined) ?? null,
        posterUrl,
        posterColor,
        backdropUrl: backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : null,
        trailerUrl,
        imdbRating,
        rtScore,
        imdbTopMovieRank: imdbMovieEntry?.rank ?? null,
        imdbTopTvRank: null,
        certificate: imdbMovieEntry?.certificate || null,
        tvType: null,
        tvStartYear: null,
        tvEndYear: null,
        oscarNominations: oscarRecords.length,
        oscarWins: oscarRecords.filter(r => r.won).length,
        oscarCategories: oscarRecords,
        ggNominations: ggRecords.length,
        ggWins: ggRecords.filter(r => r.won).length,
        ggCategories: ggRecords,
        cannesNominations: cannesRecords.length,
        cannesWins: cannesRecords.filter(r => r.won).length,
        cannesCategories: cannesRecords,
        isPickOfDay: false,
        pickOfDayDate: null,
      });

      enrichedTmdbIds.add(tmdbId);
      console.log(`  ok Done (tmdbId=${tmdbId}${imdbId ? `, imdb=${imdbId}` : ''}${imdbMovieEntry ? `, IMDB #${imdbMovieEntry.rank}` : ''})`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ title, year, reason: msg });
      console.error(`  x Error: ${msg}`);
    }
  }

  // ── Phase 2: IMDB-only movies (in IMDB Top 250 but not in any award file) ───
  const awardFilmKeys = new Set(
    uniqueFilms.map(f => `${f.title.toLowerCase().trim()}|${f.year.trim()}`),
  );
  const imdbOnlyMovies = [...imdbMovieMap.values()].filter(
    row => !awardFilmKeys.has(`${row.name.toLowerCase().trim()}|${row.year}`),
  );

  console.log(`\nIMDB-only movies to enrich: ${imdbOnlyMovies.length}`);

  let j = 0;
  for (const row of imdbOnlyMovies) {
    j++;
    const year = String(row.year);
    console.log(`[IMDB-movie ${j}/${imdbOnlyMovies.length}] ${row.name} (${year}) — IMDB #${row.rank}`);

    try {
      await delay(250);
      const tmdbId = await tmdbSearch(row.name, year);

      if (!tmdbId) {
        errors.push({ title: row.name, year, reason: 'No TMDB match found (IMDB-only movie)' });
        console.log('  x No TMDB match');
        continue;
      }

      if (enrichedTmdbIds.has(tmdbId)) {
        console.log('  ~ Already enriched via awards, skipping duplicate');
        continue;
      }

      await delay(250);
      const details = await tmdbDetails(tmdbId);

      const crew = (details.credits as { crew?: Array<{ job: string; name: string }> })?.crew ?? [];
      const castRaw = (details.credits as { cast?: Array<{ name: string }> })?.cast ?? [];
      const videos = (details.videos as { results?: Array<{ type: string; site: string; key: string }> })?.results ?? [];
      const genres = ((details.genres as Array<{ name: string }> | undefined) ?? []).map(g => g.name);

      const director = crew.find(c => c.job === 'Director')?.name ?? null;
      const cast = castRaw.slice(0, 10).map(c => c.name);
      const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
      const runtime = (details.runtime as number | null | undefined) ?? parseImdbRuntime(row.time);
      const imdbId = (details.imdb_id as string | null | undefined) ?? null;
      const originalTitleRaw = (details.original_title as string | null | undefined) ?? null;
      const originalTitle =
        originalTitleRaw && originalTitleRaw.toLowerCase() !== row.name.toLowerCase()
          ? originalTitleRaw
          : null;

      // Fetch RT score from OMDB (IMDB rating already known from IMDB file)
      let rtScore: number | null = null;
      if (imdbId) {
        await delay(250);
        try {
          const omdb = await omdbDetails(imdbId);
          const ratings = omdb.Ratings as Array<{ Source: string; Value: string }> | undefined;
          const rtRaw = ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value;
          if (rtRaw) rtScore = parseInt(rtRaw.replace('%', ''), 10);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`  ! OMDB skipped: ${msg}`);
        }
      }

      const slug = makeSlug(row.name, year, usedSlugs);
      const posterPath = details.poster_path as string | null | undefined;
      const backdropPath = details.backdrop_path as string | null | undefined;
      const posterUrl = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;
      const posterColor = await extractDominantPosterColor(posterUrl);

      enriched.push({
        slug,
        tmdbId,
        imdbId,
        title: row.name,
        originalTitle,
        year: row.year,
        releaseYear: row.year,
        runtime,
        genres,
        contentType: contentTypeFromGenres(genres, runtime),
        plot: (details.overview as string | null | undefined) ?? null,
        director,
        cast,
        language: (details.original_language as string | null | undefined) ?? null,
        posterUrl,
        posterColor,
        backdropUrl: backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : null,
        trailerUrl,
        imdbRating: row.rating,
        rtScore,
        imdbTopMovieRank: row.rank,
        imdbTopTvRank: null,
        certificate: row.certificate || null,
        tvType: null,
        tvStartYear: null,
        tvEndYear: null,
        oscarNominations: 0,
        oscarWins: 0,
        oscarCategories: [],
        ggNominations: 0,
        ggWins: 0,
        ggCategories: [],
        cannesNominations: 0,
        cannesWins: 0,
        cannesCategories: [],
        isPickOfDay: false,
        pickOfDayDate: null,
      });

      enrichedTmdbIds.add(tmdbId);
      console.log(`  ok Done (tmdbId=${tmdbId}, IMDB #${row.rank})`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ title: row.name, year, reason: msg });
      console.error(`  x Error: ${msg}`);
    }
  }

  // ── Phase 3: IMDB Top 250 TV shows ──────────────────────────────────────────
  const tvRows = [...imdbTvMap.values()];
  console.log(`\nIMDB TV shows to enrich: ${tvRows.length}`);

  let k = 0;
  for (const row of tvRows) {
    k++;
    console.log(`[TV ${k}/${tvRows.length}] ${row.name} (${row.startYear}) — IMDB #${row.rank}`);

    try {
      await delay(250);
      const tmdbId = await tmdbTvSearch(row.name, row.startYear);

      if (!tmdbId) {
        errors.push({ title: row.name, year: String(row.startYear), reason: 'No TMDB TV match found' });
        console.log('  x No TMDB match');
        continue;
      }

      await delay(250);
      const details = await tmdbTvDetails(tmdbId);

      const crew = (details.credits as { crew?: Array<{ job: string; name: string }> })?.crew ?? [];
      const castRaw = (details.credits as { cast?: Array<{ name: string }> })?.cast ?? [];
      const videos = (details.videos as { results?: Array<{ type: string; site: string; key: string }> })?.results ?? [];
      const genres = ((details.genres as Array<{ name: string }> | undefined) ?? []).map(g => g.name);
      const externalIds = details.external_ids as Record<string, unknown> | undefined;

      const director = crew.find(c => c.job === 'Director')?.name ?? null;
      const cast = castRaw.slice(0, 10).map(c => c.name);
      const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

      const episodeRuntimes = details.episode_run_time as number[] | undefined;
      const runtime = episodeRuntimes?.[0] ?? null;

      const imdbId = (externalIds?.imdb_id as string | null | undefined) ?? null;
      const originalNameRaw = (details.original_name as string | null | undefined) ?? null;
      const originalTitle =
        originalNameRaw && originalNameRaw.toLowerCase() !== row.name.toLowerCase()
          ? originalNameRaw
          : null;

      const firstAirDate = (details.first_air_date as string | null | undefined) ?? null;
      const lastAirDate = (details.last_air_date as string | null | undefined) ?? null;
      const tvStartYear = firstAirDate ? parseInt(firstAirDate.slice(0, 4), 10) : row.startYear;
      const tvEndYear = lastAirDate ? parseInt(lastAirDate.slice(0, 4), 10) : (row.endYear ?? null);

      const slug = makeSlug(row.name, row.startYear, usedSlugs);
      const posterPath = details.poster_path as string | null | undefined;
      const backdropPath = details.backdrop_path as string | null | undefined;
      const posterUrl = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;
      const posterColor = await extractDominantPosterColor(posterUrl);

      const contentType = row.type ? contentTypeFromImdbTvType(row.type) : 'tv-series';

      enriched.push({
        slug,
        tmdbId,
        imdbId,
        title: row.name,
        originalTitle,
        year: tvStartYear,
        releaseYear: tvStartYear,
        runtime,
        genres,
        contentType,
        plot: (details.overview as string | null | undefined) ?? null,
        director,
        cast,
        language: (details.original_language as string | null | undefined) ?? null,
        posterUrl,
        posterColor,
        backdropUrl: backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : null,
        trailerUrl,
        imdbRating: row.rating,
        rtScore: null,
        imdbTopMovieRank: null,
        imdbTopTvRank: row.rank,
        certificate: row.certificate || null,
        tvType: row.type || null,
        tvStartYear,
        tvEndYear,
        oscarNominations: 0,
        oscarWins: 0,
        oscarCategories: [],
        ggNominations: 0,
        ggWins: 0,
        ggCategories: [],
        cannesNominations: 0,
        cannesWins: 0,
        cannesCategories: [],
        isPickOfDay: false,
        pickOfDayDate: null,
      });

      console.log(`  ok Done (tmdbId=${tmdbId}, type=${contentType})`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ title: row.name, year: String(row.startYear), reason: msg });
      console.error(`  x Error: ${msg}`);
    }
  }

  fs.writeFileSync(ENRICHED_JSON, JSON.stringify(enriched, null, 2), 'utf-8');

  if (errors.length > 0) {
    const errorsCsv = stringify(errors, { header: true, columns: ['title', 'year', 'reason'] });
    fs.writeFileSync(ERRORS_CSV, errorsCsv, 'utf-8');
  } else if (fs.existsSync(ERRORS_CSV)) {
    fs.unlinkSync(ERRORS_CSV);
  }

  const awardCount = enriched.filter(f => f.oscarNominations + f.ggNominations + f.cannesNominations > 0).length;
  const imdbMovieCount = enriched.filter(f => f.imdbTopMovieRank !== null).length;
  const tvCount = enriched.filter(f => f.imdbTopTvRank !== null).length;

  console.log('\n--- Summary ---');
  console.log(`Total enriched : ${enriched.length}`);
  console.log(`  Award films  : ${awardCount}`);
  console.log(`  IMDB movies  : ${imdbMovieCount}`);
  console.log(`  TV shows     : ${tvCount}`);
  console.log(`Errors         : ${errors.length}`);
  console.log(`Output         : ${ENRICHED_JSON}`);
  if (errors.length > 0) console.log(`Error log      : ${ERRORS_CSV}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
