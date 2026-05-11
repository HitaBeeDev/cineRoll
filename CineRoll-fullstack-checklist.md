# CineRoll — Fullstack MVP Checklist (Text-Only)

---

## Application Summary

**CineRoll** is a film discovery web app whose core value is **deep award-data filtering**. Users can slice the full catalogue by every dimension the dataset provides — nominee name, director, award body, category, win/nomination status, ceremony year, genre, content type, and decade — and then either browse results or roll a random film from within that filtered set.

### What it does

- **Advanced Award Filtering** — The primary feature. Users compose filters from: award body (Oscar / Golden Globe / Cannes), win vs. nomination status, specific category (Best Picture, Best Director, Best Actress, etc.), ceremony year, nominee or winner name, director name, genre, content type (movie, documentary, animation, etc.), and release decade. Any combination of filters can be active at once.
- **Filtered Roll** — Once filters are set, the Roll button picks a random film from within the filtered results. "Roll me a Cate Blanchett Oscar-nominated film from the 2000s" is a valid interaction.
- **Pure Roll (no filters)** — With no filters active, Roll returns a completely random film from the full dataset. Simple discovery without setup.
- **Browse & Paginate** — Filtered results are shown as a paginated grid so users can explore instead of (or in addition to) rolling.
- **Film Detail Pages** — Each film has a dedicated page (`/film/:slug`) showing full metadata: backdrop, trailer, IMDB/RT ratings, and a **complete award history across all award bodies** (Oscars, Golden Globes, Cannes, etc.) broken down by category and year.
- **Pick of the Day** — An algorithmically selected film shown on the home page each day, automatically chosen from site statistics: the most rolled / most watchlisted / most trending film in the past 24–48 hours. No manual curation needed.
- **Watchlist & Watch History** — Logged-in users can save films to a watchlist or mark them as watched (with "Not Interested" or "Watched" quick buttons after every roll; option to exclude from future rolls).
- **User Ratings** — Logged-in users can rate films they have watched (1–5 stars).
- **Film Comments** — Logged-in users can leave comments on films they have watched.
- **Feedback / Suggestions** — A public section at the bottom of the site where anyone can submit ideas, bugs, or suggestions to the team.
- **Personalized Recommendations** — On the user's profile page, film suggestions are generated from their watch history and watchlist — separate from the manually curated Pick of the Day.
- **PWA / Mobile Install** — First-time mobile visitors are shown a friendly prompt explaining how to add CineRoll to their home screen so they can access it like a native app.

### The Dataset

Hand-curated **Excel (.xlsx) files** in `backend/data/movie excel datas/`:

**Award files** — Oscar records, Golden Globe records, and Cannes records. Each file contains one row per nomination or win with: a unique award ID (`OSC-` / `GG-` / `CN-` prefix), the ceremony year, the film title, the film's release year, the award category, the nominee's name, and whether they won.

**IMDB Top 250 files** — two additional files added to the same directory:

- `IMDB_top_250_movies_structured.xlsx` — columns: `name, rank, year, time, certificate, rating` (250 top-rated movies)
- `IMDB_top_250_tvShows_structured.xlsx` — columns: `name, rank, start_year, end_year, certificate, type, rating` (250 top-rated TV shows)

The enrich script auto-detects file type by column headers: award files are identified by the `Id` column; IMDB files by the `rank` column. Award films are enriched via TMDB + OMDB. IMDB data is overlaid on matching award films (title+year match sets rank, certificate, and IMDB rating). IMDB-only movies and all TV shows are enriched separately — TV shows use TMDB's `/search/tv` and `/tv/:id` endpoints. **All filterable dimensions per film**: award body, nominee, category, ceremony year, win/nomination, genre, content type (including tv-series / tv-mini-series), release decade, IMDB rating, RT score, IMDB Top 250 rank, certificate, TV type, TV start/end year.

### Stack

| Layer         | Technology                                                                      |
| ------------- | ------------------------------------------------------------------------------- |
| Frontend      | Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Framer Motion · Radix UI |
| Backend       | Node.js · Express 5 · Zod (validation)                                          |
| Database      | PostgreSQL (Neon) · Prisma ORM                                                  |
| Auth          | Auth.js (NextAuth v5) · Google OAuth                                            |
| Shared Types  | TypeScript monorepo · `@cineroll/types` package                                 |
| External APIs | TMDB API (film metadata) · OMDB API (ratings)                                   |

### Structure

Monorepo with `cineroll/` root containing:

- `frontend/` — Next.js app
- `backend/` — Express API + Prisma + data pipeline scripts
- `packages/types/` — shared TypeScript interfaces (`Film`, `RollEvent`, `FilterState`, etc.)

---

**Stack**: Next.js 16 Frontend · Node.js/Express 5 Backend · PostgreSQL (Neon) · Prisma

**Structure**: Monorepo with `cineroll/` root containing `frontend/` (Next.js), `backend/` (Express), and `packages/types/` (shared TypeScript types).

---

## Build Order (Must Follow Sequence)

1. Monorepo Setup
2. Shared Types Package
3. Backend — Project Setup
4. Backend — Database & Prisma
5. Backend — Film Data Pipeline (Excel + Oscar + Golden Globes + Cannes + IMDB Top 250 + Film Color Theming)
6. Backend — API Routes (incl. Autocomplete + Person endpoints)
7. Frontend — Project Setup
   7b. Cinematic Design System & UI/UX
8. Frontend — Base Components (Night Mode Pill, Login/Sign Up Buttons)
   8b. The Snob Test (viral quiz — no auth needed)
   8c. First-Visit Onboarding
9. Frontend — Roll Feature (Mood Presets, Share, Spacebar, Not Interested/Watched, Session History, Time Capsule Roll)
   9b. Roll Battle (Swipe to Decide)
   9c. Blind Roll — Film Quiz Mode
   9d. Natural Language Roll (AI — Gemini API)
10. Frontend — Pick of the Day (Algorithmic)
11. Frontend — Film Detail Pages (all award bodies + Trailer Modal + Color Theming + Similar Films + Original Title)
    11b. Tonight's Pick — Shareable Card
    11c. Person Detail Pages (/person/:slug)
12. Frontend — Browse, Filter & Filtered Roll (content type filter + Autocomplete)
    12b. Marathon Planner
    12c. Filter UX — Making It Feel Exciting
13. Internationalization (i18n)
    13.5. Rating Filters (IMDb & Rotten Tomatoes)
    13.6. Runtime Filter (Quick Watch / Standard / Long Haul / Epic)
14. Frontend — Pages & Routing
15. Auth & User System (Email OTP Verification + Google OAuth)
16. Watchlist & Watch History
    16b. Custom Lists (beyond Watchlist)
17. Profile & Personalized Recommendations
    17b. User Ratings for Watched Films
    17c. Film Comments (authenticated users)
    17d. Feedback / Suggestions Section (public footer form)
    17e. Completionist Tracker
    17f. CineRoll Wrapped
    17g. Public Taste Profile (/u/:username)
18. Admin Panel
19. Stats & Discovery Page
    19b. Weekly Community Challenge
20. Weekly Email Pick (opt-in newsletter)
21. Data Privacy & Security
22. PWA & Mobile Homescreen Install (incl. Push Notifications)
23. Deployment
24. Documentation
25. Performance & Lighthouse Audit
26. Google Search Ranking (SEO)
    26b. Award Hub Pages (/awards/oscars, /awards/golden-globes, /awards/cannes)
    26c. Blog & Pillar Content Strategy
27. Legal Pages (Privacy Policy, Terms of Service, Cookie Policy)
28. CI/CD Pipeline (GitHub Actions)
29. Automated Testing (Playwright E2E + Vitest)
30. GDPR & Account Deletion
31. Content Moderation
32. Uptime Monitoring
33. Error Tracking (Sentry)

---

## 1. Monorepo Setup

- [x] Create root project folder `cineroll` and initialize git
- [x] Initialize npm workspace by creating a root `package.json` with workspace declarations for frontend, backend, and packages/types
- [x] Set root `package.json` to private to prevent accidental publishing
- [x] Create root `.gitignore` to exclude node_modules, dist folders, environment files, and generated data files (films-enriched.json, films-final.json, enrichment-errors.csv)
- [x] Install root-level dev dependencies: Husky (for git hooks), lint-staged (for pre-commit linting), commitlint (for commit message validation), and concurrently (to run frontend + backend together)
- [x] Initialize Husky to set up git hooks infrastructure
- [x] Configure commit message linting with Conventional Commits format (feat:, fix:, docs:, etc.)
- [x] Add pre-commit hook to run linting on staged TypeScript and TSX files
- [x] Create root `tsconfig.base.json` with strict TypeScript settings (strict mode, noUncheckedIndexedAccess, exactOptionalPropertyTypes, etc.)
- [x] Add workspace scripts to root `package.json`: `npm run dev` (runs backend + frontend concurrently), `npm run build`, `npm run lint`, `npm run type-check`
- [x] Verify monorepo is working by running `npm ls --workspaces`; should list all three workspaces

---

## 2. Shared Types Package

- [x] Create `packages/types/src/` directory structure
- [x] Create `packages/types/package.json` that exports the compiled types from dist folder
- [x] Create `packages/types/tsconfig.json` that extends the root tsconfig and outputs compiled types
- [x] Create `packages/types/src/index.ts` with TypeScript interfaces for all data models:
  - AwardRecord interface: `{ awardBody: "oscar" | "goldenglobe" | "cannes"; awardYear: number; category: string; nominee: string; won: boolean }` — one record per nomination/win, stored in oscarCategories / ggCategories / cannesCategories JSON arrays
  - Film interface (id, slug, tmdbId, imdbId, title, releaseYear, runtime, genres array, **contentType** string, plot, director, cast array, language, poster URL, backdrop URL, trailer URL, IMDB rating, Rotten Tomatoes score, Oscar nominations/wins/categories, Golden Globe nominations/wins/categories, **Cannes nominations/wins/categories**, pick of day flag and date, **imdbTopMovieRank** (number | null — IMDB Top 250 rank for movies), **imdbTopTvRank** (number | null — IMDB Top 250 rank for TV shows), **certificate** (string | null — age/content rating: R, PG-13, TV-MA, etc.), **tvType** (string | null — IMDB TV show type: "TV Series" | "TV Mini Series"; null for movies), **tvStartYear** (number | null — first air year for TV shows), **tvEndYear** (number | null — last air year for TV shows))
  - RollEvent interface (id, filmId, timestamp)
  - FilterState interface: `search` (film title), `person` (nominee/winner name — searches all AwardRecord entries), `director` (director name), `awardBody` ("oscar" | "goldenglobe" | "cannes" | "all"), `winnerOnly` (boolean), `nominatedOnly` (boolean), `category` (award category string), `awardYear` (ceremony year number), `genre` (string), **`contentType`** (string — "movie" | "documentary" | "animation" | "short" | "tv-series" | "tv-mini-series"), `decadeMin`/`decadeMax` (release decade), `imdbRatingMin`/`imdbRatingMax` (IMDB score range 0–10), `rtScoreMin` (Rotten Tomatoes min score), **`certificate`** (age rating string — R, PG-13, TV-MA, etc.), **`imdbTopMoviesOnly`** (boolean — only IMDB Top 250 movies), **`imdbTopTvOnly`** (boolean — only IMDB Top 250 TV shows), **`tvType`** (TV show type string), `page` (number)
  - PaginatedFilms interface (films array, total count, current page, total pages)
  - ApiError interface (error message, error code)
  - User interface (id, email, name, image)
  - WatchlistEntry interface (id, userId, filmId, addedAt)
  - WatchedEntry interface (id, userId, filmId, watchedAt, doNotSuggest)
  - **UserRating interface** (id, userId, filmId, rating Float 1.0–10.0 step 0.5, createdAt, updatedAt)
  - **FilmComment interface** (id, userId, filmId, body text, createdAt, updatedAt, user name/avatar)
  - **SiteFeedback interface** (id, email optional, body text, createdAt)
- [x] Add IMDB Top 250 fields to Film interface: `imdbTopMovieRank`, `imdbTopTvRank`, `certificate`, `tvType`, `tvStartYear`, `tvEndYear`
- [x] Add IMDB filter fields to FilterState: `certificate`, `imdbTopMoviesOnly`, `imdbTopTvOnly`, `tvType`, `imdbRatingMax`
- [x] Build the types package: run TypeScript compiler
- [x] Verify compiled types exist in `packages/types/dist/` with both JS and .d.ts files

---

## 3. Backend — Project Setup

- [x] Create backend folder and initialize npm project
- [x] Set backend `package.json` name to @cineroll/backend
- [x] Add shared types package as a dependency in backend
- [x] Install backend production dependencies: Express (web framework), CORS (cross-origin requests), Helmet (security headers), Morgan (request logging), dotenv (environment variables), Prisma client (ORM), and Zod (validation)
- [x] Install backend dev dependencies: TypeScript, ts-node-dev (development server), type definitions for Express/Node/CORS/Morgan, Prisma CLI, and tsx (TypeScript executor)
- [x] Create backend `tsconfig.json` that extends root tsconfig with output directory, root directory, and module settings
- [x] Add scripts to backend `package.json`: dev (run dev server), build (compile TypeScript), start (run production build), lint (run ESLint), type-check (check TypeScript), db:migrate (run Prisma migrations), db:generate (regenerate Prisma client), db:seed (seed database), enrich (run enrichment script)
- [x] Create backend `.env` file with DATABASE_URL (Neon PostgreSQL connection string), PORT (4000), FRONTEND_URL (for CORS), TMDB_API_KEY, and OMDB_API_KEY
- [x] Create backend `.env.example` as a template showing what environment variables are needed
- [x] Create backend folder structure: src/ with subdirectories for routes, middleware, lib, scripts
- [x] Create `backend/src/index.ts` as entry point that initializes Express server
- [x] Create `backend/src/app.ts` with Express app setup (middleware, routes, error handling)
- [x] Create `backend/src/config.ts` to load and validate environment variables

---

## 4. Backend — Database & Prisma

- [x] Create `backend/prisma/schema.prisma` with Prisma schema definition
- [x] Define Film model with all fields: id (primary key), slug (unique), TMDB ID, IMDB ID, title, **originalTitle** (String, nullable — original language title from TMDB, null if same as English title), releaseYear (the film's release year), runtime, genres (array), **contentType** (string — "movie" | "documentary" | "animation" | "short" | "tv-series" | "tv-mini-series"), plot, director, cast (array), language, poster URL, backdrop URL, trailer URL, IMDB rating, Rotten Tomatoes score, Oscar fields (nominations count, wins count, categories JSON array of AwardRecord), Golden Globe fields (nominations count, wins count, categories JSON array of AwardRecord), **Cannes fields** (nominations count, wins count, categories JSON array of AwardRecord), pick of day flag and date, timestamps
- [x] Add IMDB Top 250 fields to Film model: `imdbTopMovieRank` (Int, nullable), `imdbTopTvRank` (Int, nullable), `certificate` (String, nullable — R, PG-13, TV-MA, etc.), `tvType` (String, nullable — raw IMDB type: "TV Series" | "TV Mini Series"), `tvStartYear` (Int, nullable), `tvEndYear` (Int, nullable)
- [x] Run migration for IMDB Top 250 fields: `npm run db:migrate --workspace=backend` (migration file: `20260507200000_add_imdb_top250_fields`)
- [x] Regenerate Prisma client after schema change: `npm run db:generate --workspace=backend`
- [x] Define RollEvent model with id, filmId (foreign key to Film), and timestamp
- [x] Define relationships: RollEvent belongs to Film, Film has many RollEvents
- [x] Set up Prisma to use PostgreSQL database
- [x] Run Prisma migration to create database schema: `prisma migrate dev --name init`
- [x] Verify database tables are created in Neon PostgreSQL console
- [x] Regenerate Prisma client: `prisma generate`
- [x] Create `backend/src/lib/prisma.ts` as a singleton instance of Prisma client for reuse across routes

---

## 5. Backend — Film Data Pipeline (Excel + Oscar + Golden Globes + Cannes + IMDB Top 250)

### 5.0 Data File Preparation

- [x] Create `backend/data/` directory
- [x] Add **all data files** to root `.gitignore` so they are never committed — only the owner can access raw data (see Section 18: Data Privacy & Security for how to ensure this even if files were accidentally committed)
- [x] Prepare Oscar data as **Excel (.xlsx)** file(s) in `backend/data/` — no CSV conversion needed. Columns: `Id, Award Year, Movie Name, Release Year, Type Of Award, Award Winner, Award Nominee`
  - `Id` format: `OSC-{year}-{nn}` (e.g. `OSC-1929-01`)
  - `Award Winner` = person/studio name if they won, empty/NaN if nominated only
- [x] Prepare Golden Globe data as Excel (.xlsx) — same column structure, `Id` format: `GG-{year}-{nn}`
- [x] Prepare Cannes data as Excel (.xlsx) — same column structure, `Id` format: `CN-{year}-{nn}`
- [x] Prepare IMDB Top 250 data as two Excel (.xlsx) files in `backend/data/`: `IMDB_top_250_movies_structured.xlsx` (columns: `name, rank, year, time, certificate, rating`) and `IMDB_top_250_tvShows_structured.xlsx` (columns: `name, rank, start_year, end_year, certificate, type, rating`) — used to populate `imdbTopMovieRank`, `imdbTopTvRank`, `certificate`, `tvType`, `tvStartYear`, `tvEndYear` on the Film model
- [x] Install Excel parsing library in backend: `npm install xlsx --workspace=backend`
- [x] Update enrich script to auto-discover and read all `.xlsx` files in `backend/data/movie excel datas/` (Oscar, Golden Globe, Cannes award files + IMDB Top 250 movies + IMDB Top 250 TV shows) — award files are identified by the `Id` + `Award Year` columns; IMDB files are identified by the `rank` column; the `Id` prefix (`OSC-` / `GG-` / `CN-`) determines award body automatically
- [x] After pipeline runs and data is seeded, **remove all intermediate/old unused files** from `backend/data/` (e.g. old CSV files, old JSON drafts). Never delete original `.xlsx` source files.

### 5a. Enrichment Script — Fetch Data from TMDB & OMDB APIs

- [x] Install Excel parsing library in backend: `npm install xlsx --workspace=backend` (replaces csv-parse)
- [x] Create `backend/.env.local` with TMDB_API_KEY and OMDB_API_KEY (these are only for enrichment, not used at runtime)
- [x] Update `backend/src/scripts/enrich.ts` script to:
  - Load environment variables from .env.local (TMDB_API_KEY, OMDB_API_KEY)
  - Auto-discover all `.xlsx` files in `backend/data/movie excel datas/` recursively via `discoverWorkbookFiles()`
  - Detect file type for each workbook using `detectFileType()`: reads first-row headers — award files have `Id` + `Award Year`; IMDB movies have `rank` + `time`; IMDB TV shows have `rank` + `start_year`
  - Parse IMDB movies file into `ImdbMovieRow` lookup map keyed by `"lowercaseTitle|year"`
  - Parse IMDB TV shows file into `ImdbTvRow` lookup map keyed by `"lowercaseName|startYear"`
  - Parse IMDB runtime from "2h 22m" format into integer minutes via `parseImdbRuntime()`
  - **Phase 1 — Award films**: group award rows by (title + release year); for each unique film:
    - Build `oscarCategories`, `ggCategories`, `cannesCategories` arrays of `AwardRecord` objects: `{ awardBody, awardYear, category, nominee, won }`
    - Calculate `oscarNominations`, `oscarWins`, `ggNominations`, `ggWins`, `cannesNominations`, `cannesWins` counts
    - Search TMDB movie API using film title and release year to get TMDB ID
    - If no match found, log error to enrichment-errors.csv and continue
    - Fetch full TMDB movie details: runtime, genres, **content type** (movie / documentary / animation / short), **original title** (only if different from English title), director, cast (top 10), IMDB ID, poster, backdrop, trailer URL
    - Overlay IMDB Top 250 data: if title+year matches IMDB movie map, set `imdbTopMovieRank`, `certificate`, and use IMDB file `rating` as `imdbRating` (more complete than OMDB)
    - If not in IMDB Top 250, use IMDB ID to query OMDB API for IMDB rating and Rotten Tomatoes score
  - **Phase 2 — IMDB-only movies**: enrich movies that appear in IMDB Top 250 but not in any award file; search TMDB movie endpoint, fetch full details, set `imdbTopMovieRank`/`certificate`/`imdbRating` from IMDB file; fetch RT score from OMDB only; skip if TMDB ID already enriched in Phase 1
  - **Phase 3 — IMDB TV shows**: enrich all 250 TV shows (award files cover only movies); search TMDB `/search/tv?first_air_date_year=<year>`; fetch `/tv/:id?append_to_response=credits,videos,external_ids`; set `imdbTopTvRank`, `certificate`, `tvType`, `tvStartYear`, `tvEndYear`, `contentType` (tv-series / tv-mini-series via `contentTypeFromImdbTvType()`)
  - Generate a unique slug for every film (lowercase title with hyphens, append year then counter if duplicate)
  - Add rate limiting between API calls (250ms delay) to respect rate limits
  - Write all successfully enriched films to films-enriched.json
  - Write failed films to enrichment-errors.csv with reason
  - Log summary: total enriched, award films, IMDB movies, TV shows, errors
- [x] Run enrichment script — **needs re-run**: current `films-final.json` predates IMDB Top 250 fields and TV shows; re-run with `npm run enrich --workspace=backend`
- [x] Review enrichment-errors.csv after re-run
- [x] Fix any failed films after re-run (or confirm N/A)
- [ ] **Manually fix fetch-failed films**: The following films are missing from the DB because the enrichment API call timed out — re-run enrich for just these or manually add their JSON entries to `films-final.json` and re-seed:
  - The Shining (1980)
  - Once Upon a Time in the West (1968)
  - Any other `fetch failed` entries in `enrichment-errors.csv`
- [ ] **Manually fix missing TV shows**: 17 IMDB Top 250 TV shows had no TMDB match and are absent — review `enrichment-errors.csv` for `No TMDB TV match found` rows and add manually if desired (notable ones: Dragon Ball Z, Blackadder, Mystery Science Theater 3000)
- [ ] **Manually add films that had no TMDB match**: open `enrichment-errors.csv`, go through the "No TMDB match" entries, and for important films (major Oscar/GG/Cannes winners that should be in the dataset), manually create their JSON entry in `films-final.json` with data filled in by hand (poster URL from another source, plot, cast, etc.)
- [x] Validate output: slugs unique, `originalTitle` casing bug stays fixed, IMDB ranks populated, TV shows present, `posterColor` populated
- [x] Save validated result as `backend/data/films-final.json`

### 5b. Film Color Extraction (at seed time)

- [x] Install color extraction library in backend: `npm install sharp node-vibrant --workspace=backend`
- [x] In the enrich script, after fetching the TMDB poster URL, download the poster image and extract the dominant color using `node-vibrant`
- [x] Store the dominant hex color (e.g. `#8B4513`) as a `posterColor` string field on the Film model
- [x] Add `posterColor` (String, nullable) to the Prisma Film model and run migration
- [x] Fallback: if extraction fails (no poster, network error), store `null`; frontend falls back to a neutral default color

### 5c. Seed Database

- [x] Create `backend/src/scripts/seed.ts` that:
  - Reads films-final.json
  - Loops through each film and inserts into PostgreSQL using Prisma (upsert to handle re-runs)
  - Handles JSON fields for cast, award categories properly
- [x] Run seed script: `npm run db:seed --workspace=backend`
- [x] Verify in Neon PostgreSQL console that row count matches films-final.json length
- [x] Spot-check 5 films by querying database

### 5d. Database Performance Optimization

- [x] Create database indexes on frequently queried columns:
  - [x] Index on `title` column for search queries (`Film_title_idx`)
  - [x] Index on `year` column for filtering by decade (`Film_year_idx`)
  - [x] Index on `genres` (array column) for genre filtering (`Film_genres_gin_idx`)
  - [x] Full-text search index using PostgreSQL pg_trgm extension for typo-tolerant search (`Film_title_trgm_idx`)
  - [x] Unique index on `slug` column for fast lookups by slug (`Film_slug_key`, created by Prisma unique constraint)
- [x] Enable connection pooling: backend now uses `DATABASE_POOL_SIZE=25` by default via the Prisma PostgreSQL adapter; keep Neon configured to use the pooled connection endpoint with a pool size in the 25-50 range for production traffic
- [x] Test database query performance: `npm run db:perf --workspace=backend` passes with search queries under 100ms and detail lookups under 50ms
- [x] Monitor slow queries using PostgreSQL slow query log or Neon analytics: backend now emits slow Prisma query warnings for queries over `SLOW_QUERY_THRESHOLD_MS=100`; Neon analytics should remain the production monitoring source
- [x] Implement query caching if needed (Redis) for frequently accessed data like "Pick of the Day": not needed at current measured query times; revisit when API traffic or Neon analytics shows repeated slow reads

### 5e. IMDB Top 250 Integration

The dataset now includes two IMDB Top 250 Excel files alongside the award files. These are identified automatically by column headers (no `Id` column; presence of `rank` column).

**Movies file** — `IMDB_top_250_movies_structured.xlsx`: columns `name, rank, year, time, certificate, rating`
**TV Shows file** — `IMDB_top_250_tvShows_structured.xlsx`: columns `name, rank, start_year, end_year, certificate, type, rating`

- [x] Detect IMDB file type by reading first-row headers: award files have `Id` + `Award Year`; movie IMDB files have `rank` + `time`; TV IMDB files have `rank` + `start_year` — implement `detectFileType(filePath)` function in enrich script
- [x] Parse IMDB movies file: extract `name, rank, year, time, certificate, rating` per row into `ImdbMovieRow` objects; build lookup map keyed by `"lowercaseTitle|year"`
- [x] Parse IMDB TV shows file: extract `name, rank, start_year, end_year, certificate, type, rating` per row into `ImdbTvRow` objects; build lookup map keyed by `"lowercaseName|startYear"`
- [x] Parse runtime from IMDB `time` format ("2h 22m") into integer minutes — `parseImdbRuntime(time: string): number | null`
- [x] Map IMDB TV `type` string to `contentType` enum values: "TV Series" → "tv-series", "TV Mini Series" → "tv-mini-series"
- [x] Overlay IMDB data onto award-enriched films: for each enriched award film, check the IMDB movie map by title+year; if found, set `imdbTopMovieRank`, `certificate`, and prefer the IMDB `rating` value over OMDB-sourced `imdbRating` (IMDB file is more complete)
- [x] Add TMDB TV search function: `tmdbTvSearch(name, startYear)` — calls `/search/tv?query=<name>&first_air_date_year=<year>`
- [x] Add TMDB TV details function: `tmdbTvDetails(tmdbId)` — calls `/tv/:id?append_to_response=credits,videos,external_ids`
- [x] Enrich IMDB-only movies (appear in IMDB Top 250 movies but not in any award file): search TMDB movie endpoint, fetch full details, set `imdbTopMovieRank`, `certificate`, `imdbRating` from IMDB file; no OMDB call needed since rating is already known
- [x] Enrich IMDB TV shows (all 250 shows are new — award files cover only movies): search TMDB TV endpoint, fetch full details (name, genres, overview, cast, crew, poster, backdrop, trailer, external_ids for IMDB ID), set `imdbTopTvRank`, `certificate`, `tvType`, `tvStartYear`, `tvEndYear`, `contentType`

- [x] Re-run enrichment script after code changes: `npm run enrich --workspace=backend`
- [ ] Review new enrichment-errors.csv for IMDB-only films/shows that had no TMDB match
- [x] Save updated output as `backend/data/films-final.json`
- [x] Re-seed database: `npm run db:seed --workspace=backend`
- [x] Verify new fields in Neon console: spot-check 3 IMDB Top 250 movies and 3 TV shows for correct rank, certificate, tvType

---

## 6. Backend — API Routes & Performance

- [x] Create `backend/src/routes/index.ts` that exports a router with all sub-routes mounted
- [x] Create `backend/src/routes/films.ts` with:
  - [x] GET /api/films (search with filters — all combinable):
    - `search` — film title text search
    - `person` — nominee or winner name (searches all AwardRecord entries across oscarCategories + ggCategories)
    - `director` — director name (matches Film.director field)
    - `awardBody` — "oscar" | "goldenglobe" | "cannes" | "all"
    - `contentType` — content type string (e.g. "movie", "documentary", "animation")
    - `winnerOnly` — boolean, show only films with at least one win
    - `nominatedOnly` — boolean, show films with nominations (won or not)
    - `category` — award category string (e.g. "Best Actress in a Leading Role")
    - `awardYear` — ceremony year (matches AwardRecord.awardYear)
    - `genre` — film genre
    - `decadeMin`/`decadeMax` — release decade range
    - `imdbRatingMin`/`imdbRatingMax` — IMDB rating range (0–10)
    - `rtScoreMin` — minimum Rotten Tomatoes score (0–100)
    - `certificate` — age/content rating (e.g. "R", "PG-13", "TV-MA")
    - `imdbTopMoviesOnly` — boolean, show only IMDB Top 250 movies
    - `imdbTopTvOnly` — boolean, show only IMDB Top 250 TV shows
    - `tvType` — TV show type string (e.g. "TV Series", "TV Mini Series")
    - `page`, `limit`

  - [x] GET /api/films/certificates — return distinct list of all content ratings in the dataset (R, PG-13, TV-MA, etc.) — used to populate certificate filter dropdown
  - [x] GET /api/films/tv-types — return distinct list of all TV show types (TV Series, TV Mini Series) — used to populate TV type filter dropdown
  - [x] GET /api/films/categories — return distinct list of all award categories in the dataset (used to populate category dropdown in UI)
  - [x] GET /api/films/award-years — return sorted list of all distinct ceremony years in the dataset (used to populate award year dropdown)
  - [x] GET /api/films/:slug (get single film by slug with full details including all AwardRecord arrays, plus `imdbTopMovieRank`, `imdbTopTvRank`, `certificate`, `tvType`, `tvStartYear`, `tvEndYear`)

- [x] Create `backend/src/routes/random.ts` with:
  - [x] GET /api/random (return a random film from database — no filters)
  - [x] GET /api/random accepts all the same filter params as /api/films — when filters are present, pick one random film from the matching set; when no filters, pick from full dataset
  - [x] Accept optional `userId` param — when provided, exclude films the user has marked `doNotSuggest=true`
- [x] Create `backend/src/routes/roll.ts` with:
  - [x] POST /api/roll (log a roll event when user clicks Roll button)
- [x] Create `backend/src/routes/pickOfDay.ts` with:
  - [x] GET /api/pick-of-day — **auto-select** today's film algorithmically: query RollEvent + WatchlistEntry counts from the last 48 hours, pick the film with the highest combined score; cache result for 1 hour; return 404 only if database is empty
- [x] For each route, implement:
  - [x] Request validation using Zod schemas (validate query params, request body)
  - [x] Authorization checks if needed
  - [x] Prisma queries to fetch data from database
  - [x] Error handling with appropriate HTTP status codes
  - [x] Consistent response format
- [x] Create `backend/src/middleware/errorHandler.ts` to catch all errors and return consistent error responses
- [x] Create `backend/src/middleware/validate.ts` to validate requests against Zod schemas
- [x] Mount all routes in `backend/src/app.ts`
- [ ] Test all endpoints using Postman or similar tool

### API Response Optimization (For Lighthouse Performance Score)

- [x] Implement response compression: enable gzip compression for all API responses
- [x] Use Helmet middleware to add security headers without impacting performance
- [x] Implement pagination for list endpoints (max 100 items per request, default 12)
- [x] Return only necessary fields from database: don't send entire objects if not needed
- [x] Use Prisma select to limit database columns returned: `{ select: { id: true, title: true, ... } }`
- [x] Add HTTP caching headers: set Cache-Control headers appropriately for different endpoints
  - [x] Pick of the day: cache for 1 hour
  - [x] Random film: cache for 1 minute
  - [x] Search results: cache for 5 minutes
  - [x] Film detail: cache for 24 hours
- [ ] Test API response times: search should complete in under 200ms, single lookups under 100ms
- [x] Monitor backend performance: check server logs for slow requests

---

## 7. Frontend — Project Setup

- [x] Create frontend folder
- [x] Initialize Next.js project (with App Router, TypeScript, Tailwind CSS)
- [x] Set frontend package name to @cineroll/frontend in package.json
- [x] Add shared types package as a dependency
- [x] Install additional frontend dependencies: Framer Motion (animations), Radix UI (accessible components), lucide-react (icons)
- [x] Create frontend `tsconfig.json` that extends root tsconfig
- [x] Configure Next.js `next.config.js` to allow image optimization from TMDB
- [x] Create frontend folder structure: src/ with subdirectories for app (pages), components, hooks, lib, styles, types
- [x] Create frontend `.env.local` with NEXT_PUBLIC_API_URL (backend API URL)
- [x] Create frontend `.env.example` as template
- [x] Setup global styles using Tailwind CSS — `globals.css` contains only `@import "tailwindcss"`; no global styles
- [x] Define CSS variables for color scheme, spacing, typography — **intentionally skipped**: no CSS variables or global styles; all colors and spacing via Tailwind utility classes directly in component files
- [x] Create root layout in `src/app/layout.tsx` with head, body, and theme provider setup
- [x] Add ESLint configuration to frontend

---

## 7b. Cinematic Design System & UI/UX

Establish the visual language before building any component. Every screen should feel like it belongs in a cinema — dark, rich, dramatic, and alive. This section defines the design foundation the entire app is built on.

---

### Color System

- [x] **Primary background:** near-black with a subtle blue-black tint (`#09090f`) — not pure black, which feels flat; the blue-black gives depth like a darkened cinema
- [x] **Surface colors (cards, panels):** `#111118` (base surface), `#1a1a24` (elevated surface), `#22222f` (hover/active surface) — layered so the UI has clear depth hierarchy
- [x] **Primary accent — Cinematic Gold:** `#D4AF37` — used for wins, highlights, the Roll button glow, active filter states; feels like an Oscar statuette
- [x] **Secondary accent — Deep Crimson:** `#8B1A1A` — used sparingly for nominated-only states, destructive actions, dramatic emphasis
- [x] **Text hierarchy:** `#F5F5F0` (primary — warm white, not harsh), `#A0A0B0` (secondary — muted lavender-grey), `#5a5a70` (tertiary — disabled/placeholder)
- [x] **Film backdrop overlay gradient:** `bg-gradient-to-t from-[#09090f] via-[#09090f]/25 to-transparent` — applied as Tailwind utilities directly on the overlay element in each component; ensures text readability while the backdrop image still breathes
- [x] **Color application strategy:** all palette values applied as Tailwind arbitrary values (e.g. `bg-[#09090f]`, `text-[#D4AF37]`) directly in component files — no additions to `globals.css`, no `tailwind.config` needed

---

### Typography

- [x] **Display font (film titles, hero headline):** `Playfair Display` configured via `next/font/google` in `layout.tsx` — CSS variable `--font-display` on `<html>`; applied in components with `font-[family-name:var(--font-display)]`
- [x] **UI font (all interface text):** `Geist` — already in project, `--font-geist-sans` variable already set on `<html>`
- [x] **Type scale:** applied as Tailwind arbitrary values at component-build time — `text-[clamp(2.5rem,6vw,5rem)]` (hero H1), `text-[clamp(2rem,4vw,3.5rem)]` (film title), `text-[1.75rem] font-semibold` (H2), `text-base leading-[1.7]` (body), `text-[0.8125rem] font-medium tracking-[0.03em]` (filter labels)
- [x] **Film titles always use the serif display font** — guideline enforced at component-build time; every film title gets `font-[family-name:var(--font-display)]`
- [x] **Letter spacing on all-caps labels** (award badges, category tags): `tracking-[0.08em]` applied in component files

---

### Hero Section

The most important screen in the app. The Roll button must feel like pressing play in a real cinema.

- [x] **Poster-color gradient background** fills the entire above-the-fold area — on roll, the film's `posterColor` hex is extracted from the API response and rendered as a `radial-gradient` emanating from the top center; no backdrop image is used
- [x] **Gradient cross-fades when a film is rolled** — `AnimatePresence` keyed on `heroColor`; opacity 0→1 / 1→0 at 600ms ease, so the dominant color blooms in for each new film; falls back to the `#09090f` base when `posterColor` is null
- [x] **Layered gradient overlay** — `bg-[linear-gradient(to_top,#09090f_0%,#09090f_25%,transparent_60%)]` + radial vignette via inline style + SVG feTurbulence grain at 4% opacity
- [x] **Hero headline** — `font-[family-name:var(--font-display)]` at `text-[clamp(2.5rem,6vw,5rem)]`, two lines, "Award&#8209;Winning" accented in gold
- [x] **Subheading** — `text-[#A0A0B0] tracking-[0.04em]` below headline
- [x] **The Roll button is the centrepiece** — `min-h-[64px]`, `bg-[linear-gradient(to_bottom,#D4AF37,#B8962E)]`, dark text, `rounded-2xl`; hover lifts + `shadow-[0_0_36px_rgba(212,175,55,0.45)]`; press `scale-[0.97]`
- [x] **"or press Space" hint** — Framer Motion opacity 0→1 triggered by `setTimeout(1000)` on mount; also wires Space key to Roll via `useRef` pattern
- [x] **Animated backdrop grain overlay** — `@keyframes hero-grain` injected via `<style dangerouslySetInnerHTML>` (static string, no XSS risk); 10-step animation over 8s, 2px drift
- [x] **Responsive layout:** single column at all screen sizes — hero shrinks `min-h-screen → min-h-[60vh]` (600ms CSS transition) when result exists so the result card peeks into view below; page scrolls naturally to the result (auto-scroll via `scrollIntoView`); result card + Pick of the Day sit in a centered `max-w-3xl` column below the hero; previous sticky two-column split removed

---

### Roll Reveal Animation

The moment between clicking Roll and seeing the result is the most important interaction in the app. Make it feel like a curtain rising.

- [x] **Step 1 — Click response (0–100ms):** Roll button scales down to 0.97 immediately on press; the hero backdrop begins a 200ms fade to a near-black overlay — the cinema goes dark
- [x] **Step 2 — Loading state (100ms – API response):** a subtle horizontal progress bar pulses across the bottom of the hero (not a spinner — a cinematic loading bar like a film projector warming up); copy under the button reads _"Finding your film…"_
- [x] **Step 3 — Reveal (API response arrives):** the film's poster-color gradient blooms in from the top of the hero (600ms ease); the cinema-dark overlay fades out simultaneously; the film result card animates up from the bottom of the screen with a spring motion (`y: 40 → 0`, `opacity: 0 → 1`, 500ms spring); the film title appears with a subtle stagger — year first (small, fades in), then title (large serif, fades in 100ms later)
- [x] **Step 4 — Settle:** the result card is fully visible; the Roll button reappears below the card with the label "Roll Again"; the poster-color gradient stays as the ambient background until the user rolls again
- [x] **If the API fails:** the overlay fades back out, the gradient stays from the previous roll (or remains dark if first roll), and a toast appears: _"Couldn't connect — check your connection and try again"_

---

//////////////////////////////////////////////////

### Film Cards

Cards appear in the browse grid, the Similar Films section, the Snob Test, and the Roll history drawer.

- [x] **Tall poster-ratio cards** — aspect ratio `2:3` (same as a film poster); never landscape, never square; posters fill the entire card face
- [x] **No visible border in resting state** — the card floats over the background with a subtle shadow (`0 4px 24px rgba(0,0,0,0.5)`); border only appears on hover/focus
- [x] **Hover state** — card lifts slightly (`translateY(-4px)`), shadow deepens, a gold border ring fades in (`border: 1px solid #D4AF37 at 60% opacity`); the poster image scales to 1.04 (slight zoom, clipped to card bounds); an overlay gradient slides up from the bottom revealing: film title (serif), year, award badge (e.g. "3 Oscar wins"), and a "Roll Similar →" ghost button
- [x] **Award badge** — top-left corner of every card; small pill showing the highest award (Oscar statuette icon + "Won" or "Nominated"); gold background for wins, dark surface with gold text for nominations
- [x] **Skeleton state** — while loading, show the card in skeleton form: the same 2:3 ratio, a shimmer animation in `#1a1a24 → #22222f → #1a1a24` cycling at 1.5s — no layout shift when the real card arrives
- [x] **Focus state for accessibility** — keyboard-focused card gets a clearly visible gold outline (`outline: 2px solid #D4AF37, outline-offset: 3px`) — same as hover but without the lift

---

### Navigation & Header

- [x] **Transparent header over the hero** — on the homepage, the nav sits over the hero backdrop with no background; the CineRoll logo and links are in warm white
- [x] **On scroll: nav transitions to a frosted-glass panel** — `backdrop-filter: blur(20px)` + `background: rgba(9,9,15,0.85)` — appears when the user scrolls past 80px; transition is 200ms ease; never a hard jump
- [x] **On film detail pages:** header is always the frosted-glass state (no transparent phase) because the backdrop is behind page content, not the header
- [x] **CineRoll wordmark** uses the serif display font in Cinematic Gold — small, elegant, not a heavy logo; feels like a distributor credit on a film poster
- [x] **Navigation links** are minimal: Home · Browse · Snob Test · Stats — no dropdowns; links use the muted secondary text colour and brighten to warm white on hover
- [x] **Mobile nav** — hamburger menu slides in a full-screen dark overlay with large, tap-friendly navigation items; overlay closes on tap-outside or Escape

---

### Film Detail Page

- [x] **Full-bleed poster-color detail hero** — the page hero layers the film's `posterColor` ambient gradient over the backdrop image when available, with gradient overlay and grain texture; the film title and metadata float over it in the bottom third
- [x] **Parallax scroll on the backdrop** — as the user scrolls down, the backdrop moves at 40% of the scroll speed (CSS `background-attachment: fixed` or Framer Motion scroll-linked transform) — creates depth and separates the hero from the content below
- [x] **Film title on the detail page uses the serif display font at maximum dramatic size** — if the title is long, it wraps gracefully; always left-aligned; the original title (if different) appears beneath it in smaller italic serif
- [x] **posterColor theming** — the film's extracted dominant poster color is used as: a faint radial glow behind the poster image, a subtle tint on the awards section heading, the active color on the trailer play button; applied as a CSS custom property `--film-accent` so all themed elements update from one value
- [x] **Awards section** — each award body (Oscar / Golden Globe / Cannes) has its own styled block with the relevant icon; wins are displayed with a gold fill, nominations with a muted outline; the layout reads like a credits block on a film
- [x] **Trailer** — the thumbnail has a large centered play button with a gold ring; clicking it opens a Framer Motion modal (backdrop blur behind) with the embedded YouTube player; the modal entrance is a scale-up from 0.9 to 1.0 with a 300ms spring
- [x] **"Watch Tonight" / share button** — fixed position on desktop (bottom-right corner), sticky above the keyboard on mobile — always reachable without scrolling back up

---

### Motion & Animation Principles

Apply these rules consistently across every component so the app feels coherent, not random.

- [x] **Duration scale:** micro-interactions 100–150ms · UI transitions 200–300ms · cinematic reveals 400–600ms · nothing longer than 700ms except intentional slow reveals
- [x] **Easing:** use `ease-out` for things entering the screen (decelerating = natural arrival); use `ease-in` for things leaving (accelerating = natural departure); use `spring` (stiffness 300, damping 28) for physical interactions like card lifts and button presses
- [x] **No layout animations without Framer Motion `layout` prop** — never let content jump when items are added/removed; always use `AnimatePresence` for conditional elements
- [x] **Reduce motion:** wrap all non-essential animations in a `useReducedMotion()` check (Framer Motion provides this); users with `prefers-reduced-motion: reduce` get instant transitions, no parallax, no grain animation
- [x] **Page transitions:** between routes, use a simple opacity fade (200ms) — not a slide, not a zoom; keeps it feeling editorial rather than app-like
- [x] **Stagger children** in lists — when the browse grid loads, film cards appear with a 40ms stagger between each (first card at 0ms, second at 40ms, etc.) so the grid "builds in" rather than all appearing at once

---

### Homepage Redesign (Retro-TV / Video-Store Aesthetic) ✓ Completed

- [x] **Full-page two-column layout** — 12-column CSS grid (`lg:grid-cols-12`): left 7 cols (filters + hero), right 5 cols (film result card); stacks vertically on mobile
- [x] **`h-screen overflow-hidden` outer shell** — prevents page-level scrollbar; both panels scroll independently with `[scrollbar-width:none] [&::-webkit-scrollbar]:w-0`
- [x] **Header redesigned** — `CineRoll` logo in coral red (`#e8453c`), `NOW SHOWING` pill badge, nav pills with active red highlight, Sign In / Sign Up buttons
- [x] **Hero headline** — three-line "One spin. / One film. / Tonight." in large display font; "One film." line in coral red accent; channel label `// CHANNEL 03 · TONIGHT` in muted monospace above
- [x] **Filter bar redesigned** — Body + Status pills in two aligned columns; Person text input + Genre dropdown below in same column alignment; Category + Award Year selects; IMDb rating pills; RT score pills; dismissible active filter chips; preset quick-tag row
- [x] **Decade filter removed** — replaced with Person free-text search input wired to `person` FilterState field
- [x] **Roll button** — dashed red border theater-marquee frame (`border-2 border-dashed border-[#e8453c]/30`), coral red fill, film-strip sprocket decorations; spacebar shortcut (`Press [SPACE] to spin`)
- [x] **Reel Pool count** — fetches total on mount (no auto-roll), shows live count in `REEL POOL · NNN · films · press [SPACE] to spin`; filtered count updates when filters are active
- [x] **No auto-roll on page load** — empty state shows until user rolls; empty state is a full-height film-strip design (sprocket holes top/bottom, animated "What's playing / tonight?" text)
- [x] **Result card REEL pill** — positioned top-left of the right panel, showing `REEL // FILM TITLE` in coral; `mb-5` spacing below pill
- [x] **Result card stats** — 3-column grid showing IMDb, RT %, and total Awards (Oscar + GG + Cannes wins combined)
- [x] **Award tags** — shows individual Oscar, Golden Globe, and Cannes nomination/win badges below stats
- [x] **`cache: "no-store"` on random endpoint** — prevents browser caching the same film on every roll
- [x] **`rtScore`, `cannesNominations`, `cannesWins` added to `RollFilm` type** and wired into result card

---

## 8. Frontend — Base Components (incl. Night Mode Pill, Login/Sign Up Buttons)

- [x] Create reusable UI components in `src/components/ui/`:
  - Button component (primary, secondary variants, sizes)
  - Card component (for film cards)
  - Skeleton component (loading placeholders)
  - Modal/Dialog component (for film details overlay)
  - Input/TextField component (for search)
  - Select component (for genre/decade filters)
  - Toast/Alert component (for error messages)
- [x] Create a Filter Bar component — redesigned with award-first layout: person search, award body pills (Oscar / Golden Globe / Cannes / All), won/nominated status pills, category dropdown, award year, genre, content type dropdown, decade slider
- [x] Create a Film Card component that displays poster, title, year, rating
- [x] **Night Mode Pill** — add a dark/light mode toggle styled as a pill (moon/sun icon) in the header/navbar; persist preference to localStorage; default to system preference
- [x] **Login / Sign Up buttons** — add "Sign In" and "Sign Up" CTA buttons in the header when the user is not authenticated; replace with user avatar + menu when logged in
- [x] Create `src/lib/format.ts` with a `formatRuntime(minutes: number | null): string` utility — converts raw minutes to human-readable "2h 22m" / "45m" / "2h" format; returns `""` if null; **used everywhere runtime is displayed — never show raw minutes**
- [x] Apply consistent styling using design tokens (colors, spacing, fonts)
- [x] Ensure all components have proper TypeScript types
- [x] Ensure accessibility: ARIA labels, semantic HTML, keyboard navigation

---

## 8b. The Snob Test (Viral Quiz — No Auth Needed)

A standalone quiz page (`/snob-test`) that works without any account. Users tick which films they've seen, get a score and a shareable title. The highest-ROI feature for driving initial traffic — people share their score, friends come to compare.

### Backend

- [x] Create GET /api/snob-test/films — return 20 films sampled from the dataset: spread across decades, genres, and award bodies; weight toward well-known titles so the quiz feels fair; shuffle on every request
- [x] Create POST /api/snob-test/score — body: `{ seenFilmIds: string[] }`; return: score (0–100), title (see below), breakdown by decade and award body; no auth required, no data stored

**Score titles (based on % seen):**

- 0–10% → "Certified Normie"
- 11–25% → "Casual Watcher"
- 26–45% → "Film Enthusiast"
- 46–65% → "Award Season Regular"
- 66–80% → "Serious Cinephile"
- 81–95% → "Film School Graduate"
- 96–100% → "The Snob"

### Frontend

- [x] Create `src/app/snob-test/page.tsx` — full-screen quiz experience
- [x] Step 1: show 20 film posters in a 4×5 grid; user taps each one they've seen (tap = highlight with checkmark); no right/wrong, just selection
- [x] Step 2: "See My Score" button submits selections and reveals result screen:
  - Giant score title ("Serious Cinephile") with a brief description
  - Score percentage with animated progress bar fill
  - Breakdown: "You've seen X% of Oscar winners, Y% of Cannes picks, Z% of films from the 2000s"
  - "Take the test again" button (reshuffles films)
  - "Find films to fill the gaps" → links to `/browse` filtered to films they haven't seen
- [x] **Shareable result card**: generate an OG image (or CSS-only card) with the score title and percentage; "Share my score" button copies a link or opens native share sheet on mobile
- [x] If the user is logged in, offer "Save your seen films to your profile" — one click syncs checked films to their WatchedFilm list
- [x] Add `/snob-test` to main navigation with a label like "Test Yourself"
- [x] Add structured data and a strong meta description for SEO: "How many award-winning films have you actually seen? Take the CineRoll Snob Test."

---

## 8c. First-Visit Onboarding

On the very first visit, guide the user through a quick taste-matching flow so the app feels personalized immediately.

- [x] Detect first visit via `localStorage` flag (`cineroll_onboarded`); if not set, show onboarding before the main home page
- [x] Fetch 8 random films from /api/films (varied decades and genres) to use as the "taste cards"
- [x] Show a full-screen step: "Which of these have you seen?" — display the 8 film posters as a grid; user taps any they've watched
- [x] On "Done" (or skip), save the tapped films to the user's watched list (if logged in) or to localStorage (if not logged in — sync on next sign-in)
- [x] After onboarding, redirect to home page; the roll and recommendations are now pre-seeded with their taste
- [x] Set `cineroll_onboarded = true` in localStorage so onboarding never shows again
- [x] "Skip" link always visible — never force the flow

---

## 9. Frontend — Roll Feature (Mood Presets, Share, Spacebar, Not Interested/Watched, Session History, Time Capsule Roll)

- [x] Create `src/app/[locale]/page.tsx` (home page under i18n routing)
- [x] Add large "Roll" button that triggers API call to /api/random
- [x] Display loading state while fetching
- [x] Display film card with backdrop image (poster fallback), title, year, rating, genres, plot, "View full details" link
- [x] **Show nominees on result card** — below the award counts, list the nominee names from `oscarCategories`, `ggCategories`, and `cannesCategories` (e.g. "Best Director · Steven Spielberg · Won"); group by award body; truncate to top 5 entries with a "Show more" toggle if longer
- [x] **Show which lists the film appears in on the result card** — display a row of badges: Oscar, Golden Globe, Cannes, IMDB Top 250 Movies, IMDB Top 250 TV Shows — show only the badges that apply to this film; e.g. a film with `oscarNominations > 0` gets an Oscar badge, `imdbTopMovieRank !== null` gets an IMDB Top 250 badge
- [x] Add "Roll Again" button to fetch another random film
- [x] Implement smooth animations for result reveal using Framer Motion (spring entry, backdrop cross-fade, cinema-dark overlay, cinematic loading bar)
- [x] Display "Pick of the Day" section that calls /api/pick-of-day endpoint (auto-selected by algorithm)
- [x] Show fallback message if no pick of day is set (empty + error states in PickOfDay component)
- [x] Add error handling with toast notification if API fails
- [x] Make responsive: single-column, hero shrinks on roll, auto-scrolls to result

### Filtered Roll (Roll Within a Filtered Set)

- [x] When the user has active filters, the Roll button picks randomly from matching films only
- [x] Backend: GET /api/random supports all filter params — picks one random film from the filtered set
- [x] Frontend: passes active filter state from FilterBar into the Roll API call
- [x] Display "Rolling from N films" live indicator when filters are active
- [x] If filters return zero films, disable Roll button and show "No films match — adjust your filters"
- [x] With no filters active, Roll behaves as before (pure random from full dataset)

### Mood / Quick Roll Presets

Pre-set filter combinations displayed as pill buttons above the main filter panel. One click loads a named filter state and immediately enables Roll.

- [x] Create a `MOOD_PRESETS` constant array: each preset has a label and a partial `FilterState` (e.g. `{ decadeMin: 1990, decadeMax: 1999 }` for "Something from the 90s")
- [x] Starter presets: "Something from the 90s", "Female director", "Under 2 hours", "Oscar Best Picture winner", "Cannes Palme d'Or", "Golden Globe drama winner", "Hidden gem (1 nomination only)"
- [x] Clicking a preset pill applies its filters to the filter state and highlights the active preset
- [x] Clicking an active preset deactivates it and resets its filters
- [x] Presets and manual filters can coexist — clicking a preset just sets filters, user can then refine further

### Shareable Roll Result

- [x] After a roll, show a **"Share this film"** button (share icon) below the film card
- [x] Clicking it copies a link to clipboard: `/film/:slug?from=roll`; show "Link copied!" toast
- [x] Also allow sharing the current filtered browse view: "Share these filters" button on browse page copies the full URL with query params
- [x] Add Open Graph meta tags to film detail pages so shared links preview nicely on social media (poster image, title, award summary)

### Keyboard Shortcut — Spacebar to Roll

- [x] On the home page, pressing **Spacebar** triggers the Roll action (same as clicking the Roll button)
- [x] Only fires when no text input is focused (prevent conflict with typing in filter fields)
- [x] Show a subtle keyboard hint label next to the Roll button: "or press Space"
- [x] On roll result, pressing **Spacebar** again rolls another film ("Roll Again")

### Session Roll History ("Back" Panel)

A slide-out drawer tracking every film rolled this session. Zero backend — uses `sessionStorage` only.

- [x] On every roll, push the film object into a `sessionStorage` key (`roll_history`) — keep the last 10 entries, drop the oldest when full
- [x] Add a "History" button (clock/history icon) in the top-right corner of the roll section; clicking it slides open a drawer
- [x] Drawer shows the last 10 rolled films as small cards (poster thumbnail, title, year) in reverse order (most recent first)
- [x] Clicking a card in the drawer navigates to that film's detail page
- [x] History clears automatically when the browser tab is closed (sessionStorage behaviour)
- [x] If history is empty, show a polished empty state in the drawer

### Home Page Filter Panel (Award-First Design)

Filter section sits **above** the Roll button. All filters are optional — user sets what they want, then hits Roll. The "Rolling from N films" counter updates live as filters change.

- [x] Filter panel placed above Roll button
- [x] **Person / cast / director search** — wired to `person` param on /api/random
- [x] **Award body pills** — Oscar / Golden Globe / Cannes / All; wired to `awardBody` param
- [x] **Status pills** — All / Won / Nominated; wired to `winnerOnly` and `nominatedOnly` params
- [x] **Category dropdown** — populated dynamically from GET /api/films/categories; wired to `category` param
- [x] **Award Year** — select populated from GET /api/films/award-years; wired to `awardYear` param
- [x] **Genre dropdown** — wired and working with award filters combined
- [x] **Decade range slider** — wired and working with award filters combined
- [x] **IMDb Rating pills** — min-rating filter (Any / 6+ / 6.5+ / 7+ / 7.5+ / 8+ / 8.5+ / 9+); wired to `imdbRatingMin`
- [x] **Rotten Tomatoes pills** — min-score filter (Any / 50%+ / 60%+ / 70%+ / 80%+ / 90%+ / 95%+); wired to `rtScoreMin`
- [x] **Active filter chips** — dismissible chip per active filter
- [x] **Clear all filters** button — resets everything to default in one click
- [x] All filters combine correctly end-to-end

---

## 9b. Roll Battle (Swipe to Decide)

Tinder-style head-to-head: two random films shown side by side, user picks one, repeat 5 rounds, the winner is tonight's film. No account needed. Extremely shareable and fun.

- [x] Create `src/app/roll-battle/page.tsx`
- [x] On load, fetch 10 random films from /api/random (used as a pool for the 5 rounds)
- [x] Each round: show two film poster cards side by side with title and award badge; user clicks/taps one to pick it; the winner advances to the next round (bracket style)
- [x] After 5 rounds, show the final winner with full film details and "Watch this tonight" CTA linking to its detail page
- [x] "Share my winner" button generates a shareable link: `/roll-battle/result?film=slug`
- [x] Smooth swipe animation between rounds using Framer Motion
- [x] "Try again" reshuffles from a fresh pool

---

## 9c. Blind Roll — Film Quiz Mode

Show only award data — no title, no poster, no plot. User guesses the film. Then the big reveal. Instantly addictive, costs zero extra data.

### How it works

- [x] Create `src/app/blind-roll/page.tsx`
- [x] Fetch a random film from /api/random (same endpoint, no changes needed)
- [x] Display ONLY: award body, ceremony year, category, nominee name, won/nominated — for all award records; runtime in minutes (no title); release decade (not exact year); number of total nominations and wins
- [x] On reveal: show the poster + full title with a dramatic animation; indicate if their guess was correct (simple string match, case-insensitive)
- [x] Score tracking: count correct guesses in the session (stored in sessionStorage); show "3/5 correct" streak counter
- [x] "Next film" button loads another blind roll without resetting the streak
- [x] Difficulty levels: Easy (show genre + decade), Medium (show decade only), Hard (show nothing except award data)
- [x] "Challenge a friend": share a link with the specific film's slug encoded so a friend gets the same blind roll question
- [x] Add "Blind Roll" to navigation as a game mode

---

## 9d. Natural Language Roll (AI — Gemini API)

Instead of dropdowns, the user describes what they want in plain English. Gemini interprets the mood and maps it to filter combinations, then rolls.

### Backend

- [x] Install Google Generative AI SDK in backend: `npm install @google/generative-ai --workspace=backend`
- [x] Add `GEMINI_API_KEY` to `backend/.env`
- [x] Create POST /api/natural-roll — body: `{ prompt: string }`; pipeline:
  1. Send the user's prompt to Gemini with a system message that explains the available FilterState fields and asks Gemini to return a JSON filter object
  2. Validate Gemini's response against the FilterState Zod schema; reject any invalid fields
  3. Pass the validated filters to the same random-film query used by /api/random
  4. Return the selected film + the interpreted filters (so the frontend can show "I searched for: Oscar winner, 1990s, drama")
- [x] Rate limit: max 10 natural-roll requests per user per hour to manage API costs
- [x] If Gemini returns filters that match zero films, retry once with a relaxed prompt asking for fewer constraints

### Frontend

- [x] Add "Describe It" as a navbar item linking to its own dedicated page (`/describe`)
- [ ] Add a link/button on the home page that takes users to `/describe` (e.g. "Can't decide? Describe it →")
- [ ] Build the `/describe` page with a full-page text area and placeholder examples: _"Something sad but beautiful"_, _"A film my dad would love"_, _"The most obscure Cannes winner you have"_
- [ ] While processing, show a fun loading message: "Asking the algorithm…"
- [ ] After roll, show the interpreted filters as chips below the result: "Searched for: Golden Globe winner · Drama · 1990s" so the user understands what happened
- [ ] "Refine" button lets them edit the prompt and re-roll
- [ ] If no films match: show Gemini's interpreted filters and suggest adjusting the description

---

## 9e. Daily Picks Page (`/picks`) ✓ Completed

Three handpicked film slots per day, each with a different mood/filter combo. Caches to localStorage so picks are stable throughout the day and auto-refresh at midnight.

- [x] Create `src/app/[locale]/picks/page.tsx`
- [x] Three pick slots with distinct filter combos and accent colors:
  - **Award Prestige** (coral `#e8453c`) — Oscar winner, IMDb 7.5+
  - **World Cinema** (blue `#4a9eff`) — Cannes winner
  - **Hidden Gem** (purple `#a78bfa`) — IMDb 7.5+, decade 1960–2005
- [x] Full-bleed backdrop image fills each card; gradient overlay ensures text readability
- [x] **localStorage caching** by date key `cinepicks-YYYY-MM-DD` — same picks shown all day; auto-refreshes on next calendar day
- [x] **Reshuffle button** — forces fresh fetch with spinning `RefreshCw` icon, overwrites cache
- [x] **Staggered Framer Motion entry** — cards animate in with `index * 0.1s` delay, spring physics
- [x] Each card shows: pick number (large muted), slot badge (colored pill), mood label, film title, year/runtime/genre, director, IMDb + RT stats, total award wins, Watch Tonight CTA + Bookmark + Share action buttons
- [x] Layout: full-height stacked cards on mobile; 3-column `flex-1` on desktop (`lg:flex-row`)
- [x] "Picks" added to `SiteNavigation` navItems

---

## 9f. AI Discover Page (`/discover`) ✓ Completed

Natural language → film search using client-side prompt parsing mapped to existing FilterState fields. No backend changes needed.

- [x] Create `src/app/[locale]/discover/page.tsx`
- [x] **Animated cycling placeholder** — 8 example prompts cycle every 3 seconds with fade transition via `AnimatePresence`
- [x] **Client-side `parsePrompt()` function** — regex-based extraction mapping plain English to `FilterState`:
  - Decade phrases ("80s", "from the 90s", "in 1970") → `decadeMin`/`decadeMax`
  - Award body keywords ("oscar", "cannes", "golden globe") → `awardBody`
  - Win/nomination status ("winner", "won", "nominated") → `winnerOnly`/`nominatedOnly`
  - Rating hints ("highly rated", "acclaimed", "masterpiece") → `imdbRatingMin`
  - Genre keywords ("drama", "comedy", "thriller", etc.) → `genre`
  - Person/director names → `person` field
  - Each matched rule appends a human-readable summary string
- [x] **8 example prompt chips** — clickable quick-starts: "A French film that broke my heart", "Kubrick's best work", "Hidden gem from the 70s", "Cannes Palme d'Or winners", "A comedy that won big", "Scarlett Johansson films", "Best Picture winners since 2000", "Something Italian and dark"
- [x] **"Interpreted as:" summary tags** — after parsing, colored chips show each matched filter so users understand how their prompt was read
- [x] **Results grid** — responsive 1→2→3→4 columns; `ResultCard` component with backdrop image, film title, genre, year, director, bookmark button, IMDb rating, View Film link
- [x] **SearchState machine** — `idle | loading | done | error` with appropriate UI for each state
- [x] **RotateCcw reset button** — clears prompt and results, returns to idle
- [x] "Discover" added to `SiteNavigation` navItems

---

## 10. Frontend — Pick of the Day

- [x] Create `PickOfDay` component displaying pick of the day on home page
- [x] Call /api/pick-of-day endpoint on page load
- [x] Display film details: poster, backdrop banner, title, year, runtime, director, genres, IMDb rating, RT score, plot, "Why this pick" reasoning, Oscar award summary
- [x] Show fallback (empty + error states with retry button)
- [x] Add navigation link to full film detail page
- [x] Handle loading (skeleton) and error states
- [x] Responsive at all screen sizes

---

## 11. Frontend — Film Detail Pages

- [ ] Create `src/app/film/[slug]/page.tsx` dynamic route
- [ ] Fetch film data by slug from `/api/films/:slug` endpoint
- [ ] Display complete film information:
  - Large poster and backdrop images
  - Title, year, runtime (formatted as "2h 22m" via `formatRuntime()`), genres
  - Director and main cast
  - Full plot synopsis
  - IMDB and Rotten Tomatoes ratings with icons
  - Language information
- [ ] Display **all awards combined** in a unified awards section:
  - A film may have Oscar, Golden Globe, and Cannes records simultaneously — show all of them
  - Oscar nominations and wins (organized by category and year)
  - Golden Globe nominations and wins (organized by category and year)
  - Cannes nominations and wins (organized by category and year)
  - Total award counts across all bodies (e.g. "5 total wins · 12 total nominations")
  - Group by award body with clear headings; do not mix records from different bodies in the same table
- [ ] **Trailer Modal** — clicking the trailer thumbnail opens a modal with the embedded YouTube player; user stays on the film page
- [ ] Show a play-button overlay on the trailer thumbnail so it's obvious it's clickable
- [ ] Modal closes on Escape key or clicking outside; pause/stop video on close
- [ ] Fallback: if no trailer URL, show "No trailer available" placeholder
- [ ] Add SEO metadata: dynamic title, description, Open Graph images, Twitter cards
- [ ] Create 404 page if film slug not found
- [ ] Make responsive: stack all content vertically on mobile, use grid layout on desktop
- [ ] Add "Back to Browse" or "Roll Again" navigation buttons
- [ ] **Original Title** — if `originalTitle` is set and differs from `title`, display it in smaller text directly below the main title (e.g. _Das Leben der Anderen_ under "The Lives of Others"); skip if null or identical
- [ ] **IMDB page link** — if `imdbId` is set, show a clickable "View on IMDB" link (opens in new tab) on the detail page; use the IMDB logo or a recognizable label; link format: `https://www.imdb.com/title/{imdbId}/`
- [ ] **Full cast with photos** — replace the plain cast name list with a horizontally scrollable row of cast member cards; each card shows the actor's TMDB profile photo (fetch from `/api/person/:id/images` or use TMDB's `profile_path` stored at enrich time), their name, and character name if available; fall back to a generic silhouette avatar if no photo
- [x] **Film Color Theming (Roll hero)** — `posterColor` from the rolled film is used as a `radial-gradient` ambient glow in the roll hero section; `hexToRgba` converts the hex to RGBA stops (0.38 → 0.12 → transparent); falls back to dark base if null
- [ ] **Film Color Theming (Detail page)** — read `posterColor` on detail pages and apply as: faint radial glow behind poster image, subtle tint on awards section heading, active color on trailer play button; use CSS custom property `--film-accent` so all themed elements update from one value; fall back to `#D4AF37` if null

### Where to Stream

- [ ] In the enrich script, after fetching TMDB movie details, make one additional call to `GET /movie/{tmdb_id}/watch/providers` (free, no new API key — uses JustWatch data via TMDB); store the result per country as a `watchProviders` JSON field on the film
- [ ] Add `watchProviders` (Json, nullable) to the Prisma Film model and run migration
- [ ] Include `watchProviders` in the `/api/films/:slug` response
- [ ] Frontend — Film Detail Page: add a "Where to Watch" section showing streaming service logos (Netflix, Hulu, Disney+, etc.) for the user's country; group by flatrate (subscription), rent, and buy
- [ ] Fall back gracefully if no providers available for the user's region: show "Not available for streaming in your region"

### Similar Films

- [ ] Backend: add GET /api/films/:slug/similar — return 6 films from the dataset that share at least one of: same director, same genre, or same ceremony year; exclude the current film; ordered by most shared dimensions first
- [ ] Frontend — Film Detail Page: add "You Might Also Like" section below the awards section
- [ ] Display as a horizontal scrollable row of film cards (poster, title, year, award badge)
- [ ] Each card links to its own detail page
- [ ] Show a small tag on each card explaining why it was suggested: "Same director", "Same genre", "From the same year"
- [ ] If fewer than 3 similar films exist, hide the section entirely

---

## 11b. Tonight's Pick — Shareable Card

One button on any film detail page generates a beautiful branded image card ready to share on Instagram, Twitter, or WhatsApp. Every share is free marketing.

- [ ] Create a `/api/og/film/:slug` endpoint that returns a dynamically generated Open Graph image using `@vercel/og` (Next.js built-in): film poster on the left, title + year + award badges on the right, CineRoll logo and URL at the bottom
- [ ] Add a **"Share Tonight's Pick"** button on the film detail page and after every roll result
- [ ] Clicking it:
  - On mobile: opens the native share sheet (`navigator.share`) with the film URL and a pre-written caption: _"Watching [Film Title] tonight — [X Oscar wins, Y GG nominations] 🎬 via CineRoll"_
  - On desktop: copies the shareable URL to clipboard and shows "Link copied!" toast
- [ ] The shared URL (`/film/:slug?from=share`) loads the film detail page with a subtle "Shared by a CineRoll user" banner at the top — drives curiosity and signups
- [ ] The OG image is also used automatically when the film URL is pasted into Twitter, iMessage, Slack, etc. (no extra step needed)
- [ ] Test OG image rendering with Twitter Card Validator and Facebook Sharing Debugger

---

## 11c. Person Detail Pages (`/person/:slug`)

A dedicated page for every director and actor in the dataset. High SEO value — searches like "meryl streep oscar nominations" map directly to this content.

### Backend

- [ ] Create GET /api/persons/:slug — return person data: name, all AwardRecord entries across Oscar + GG + Cannes where they appear as nominee, grouped by award body; list of films they're associated with (as nominee or director)
- [ ] Create GET /api/persons/autocomplete?q= — used by the search bar to suggest person names
- [ ] Generate person slugs at seed time (lowercase name with hyphens, e.g. `meryl-streep`) and store in a `Person` table or derive on the fly from AwardRecord data
- [ ] Add `Person` model to Prisma: id, slug (unique), name, tmdbPersonId (nullable — for fetching photo from TMDB), role ("actor" | "director" | "both")
- [ ] Enrich person records at seed time: fetch TMDB person photo and biography using TMDB Person API; store photoUrl and bio in the Person model

### Frontend

- [ ] Create `src/app/person/[slug]/page.tsx` dynamic route
- [ ] Fetch person data from /api/persons/:slug
- [ ] Display: name, photo (from TMDB), short bio
- [ ] Awards table: all nominations and wins grouped by award body (Oscar / GG / Cannes), with film title links and category per row
- [ ] "Films" grid: poster cards of all films this person is associated with; clicking navigates to /film/:slug
- [ ] Add "Browse films with [Name]" button → links to `/browse?person=meryl-streep`
- [ ] Add SEO metadata: dynamic title ("Meryl Streep — Oscar & Golden Globe Award History | CineRoll"), description listing their win/nomination counts
- [ ] Add structured data (JSON-LD Person schema) for Google rich results
- [ ] Create 404 page if person slug not found
- [ ] Link to person pages from: film detail cast/director section, autocomplete results, browse filter chips

---

## 12. Frontend — Browse, Filter & Filtered Roll

This is the core feature of CineRoll. The filter system is what separates the app from a simple random-picker and makes it portfolio-level. Every dimension in the award dataset should be an operable filter.

### Filter Bar

The same award-first filter panel used on the home page is also the core of the browse page. Filters are shared via the `FilterBar` component and `useFilters` hook.

- [ ] Create `src/app/browse/page.tsx` (browse page) — full filter UI + paginated results grid
- [ ] **Person / cast / director search** — free-text input searching nominee/winner names and director; same as home page filter (shared component)
- [ ] **Film title search** — separate text input for film title (browse page only, in addition to person search)
- [ ] **Award body selector** — Oscar / Golden Globe / Both pills (shared component)
- [ ] **Win status toggle** — All / Won / Nominated pills (shared component)
- [ ] **Category dropdown** — populated from GET /api/films/categories (shared component)
- [ ] **Ceremony year** — filter by award ceremony year (shared component)
- [ ] **Genre dropdown** — (shared component)
- [ ] **Content Type filter** — dropdown or pill group: Movie, Documentary, Animation, Short, Mini-Series, etc.; wire to `contentType` param
- [ ] **Decade range slider** — (shared component)
- [ ] **Active filter chips** — dismissible chip per active filter (shared component)
- [ ] **Clear all filters** button (shared component)
- [ ] Sync all filter state to URL query params so filtered browse views are shareable/bookmarkable

### Search & Filter Behavior

- [ ] All filters are combinable: "Cate Blanchett" + "Oscar" + "Won" + "2000s" is a valid compound query
- [ ] Sync all filter state to URL query parameters so filtered views are shareable and bookmarkable
- [ ] Make text inputs debounced (300ms) — don't fire API on every keystroke
- [ ] **Autocomplete on person / film search** — as the user types (min 2 chars), fetch matching suggestions from a new backend endpoint and display a dropdown:
  - GET /api/autocomplete?q=... returns up to 8 results: matching film titles, nominee/director names from the dataset
  - Results are grouped: "Films" and "People" sections in the dropdown
  - Clicking a suggestion fills the input and triggers a search immediately
  - Keyboard navigable (up/down arrows, Enter to select, Escape to close)
- [ ] Show result count: "47 films match your filters" (update as filters change)
- [ ] When result count is zero, show "No films match — try adjusting your filters" with a suggested reset

### Results Grid

- [ ] Display results in responsive grid: 2 columns mobile, 3 tablet, 4–6 desktop
- [ ] Each film card shows: poster, title, release year, award summary (e.g. "3 Oscar wins · 1 Golden Globe nomination")
- [ ] Add loading skeletons while fetching
- [ ] Implement pagination: 12 films per page; Previous / Next buttons with page number
- [ ] Make each film card clickable → navigate to /film/:slug detail page

### Filtered Roll from Browse

- [ ] "Roll from these results" button visible when filters are active — picks one random film from the filtered set and navigates to its detail page or shows it inline
- [ ] Button is disabled and shows "No matches" when filter set is empty
- [ ] Button label shows count: "Roll from 47 films"

### API Integration

- [ ] Create `src/lib/api.ts` API client with typed functions for `/api/films` and `/api/random` accepting full FilterState
- [ ] Create `src/hooks/useFilters.ts` to manage filter state
- [ ] Add URL sync to `useFilters` — read/write all filter params to URL query string so browse views are shareable
- [ ] FilterState covers: `search`, `person`, `director`, `awardBody`, `winnerOnly`, `nominatedOnly`, `category`, `awardYear`, `genre`, `decadeMin`, `decadeMax`, `page`
- [ ] Fetch category list from GET /api/films/categories and pass into FilterBar (currently hardcoded)
- [ ] Fetch award years from GET /api/films/award-years and use for award year picker

---

## 12b. Marathon Planner

"Build a movie night" — user picks a theme and the app selects 3 non-overlapping films. Shows total runtime and a shareable link.

### Backend

- [ ] Create GET /api/marathon — accepts same filter params as /api/films, plus `count` (default 3, max 5); returns `count` random non-overlapping films from the filtered set; total runtime included in response
- [ ] Ensure films are truly non-overlapping (no duplicates) even if filtered set is small

### Frontend

- [ ] Create `src/app/marathon/page.tsx` — "Movie Night Planner" page
- [ ] Filter panel (reuse FilterBar component) to set a theme: genre, decade, award body, person, etc.
- [ ] "Plan My Night" button calls /api/marathon and displays 3 film cards in a row with:
  - Poster, title, year, runtime
  - A numbered badge ("Film 1", "Film 2", "Film 3")
  - Total combined runtime shown at the bottom ("Total: 5h 23m")
- [ ] "Shuffle" button re-rolls the selection within the same filters
- [ ] "Share this marathon" button copies a URL with the filter params + the 3 film slugs encoded
- [ ] Add `/marathon` to main navigation
- [ ] Handle edge case: if fewer than `count` films match, show as many as available with a note

---

## 12c. Filter UX — Making It Feel Exciting

The filter panel is CineRoll's most-used feature. It should feel like building something, not filling out a form. Every interaction — applying a filter, seeing the count change, hitting Roll — should have energy.

### Visual Design of Pills & Active States

- [ ] **Award body pills have icons, not just text** — add a small inline icon next to each label: Oscar statuette for Oscar, a globe for Golden Globe, a palm leaf for Cannes; use SVG icons at 14px so they stay crisp
- [ ] **Active pills use a gold/warm gradient** instead of a generic blue outline — an Oscar pill when active should feel like winning, not like a checkbox; use a subtle gold gradient background with dark text
- [ ] **Runtime pills (Quick Watch / Standard / Long Haul / Epic) each have a distinct color tint** when active — Quick Watch: cool blue; Standard: neutral; Long Haul: warm amber; Epic: deep purple — so the active bucket is immediately obvious at a glance
- [ ] **Filter chips (active filter row) have entry and exit animations** — chip slides in and fades up when added; shrinks and fades out when removed; use Framer Motion `AnimatePresence` so the row reflows smoothly without jumping
- [ ] **The filter panel header reads "Build Your Roll"** instead of "Filters" — sets the right mental model from the first word

### Animated Result Count

- [ ] **Animate the result count number** when it changes — use a count-up/count-down animation (e.g. `react-countup` or a custom Framer Motion variant) so "47 films" rolling down to "12 films" feels alive, not a static text swap
- [ ] **The result count copy has personality based on the number:**
  - 0 results → _"No films match — even we couldn't find that. Try relaxing a filter."_
  - 1 result → _"Just 1 film. You know exactly what you want."_
  - 2–5 results → _"[N] films. Very specific taste."_
  - 6–20 results → _"[N] films. A good shortlist."_
  - 21–100 results → _"[N] films. Ready to roll?"_
  - 100+ results → _"[N] films. Feeling lucky?"_
- [ ] Result count text animates its opacity when the number changes so the update is noticeable without being jarring

### Active Filter Summary ("Your Roll Recipe")

- [ ] **Below the filter chips, show a plain-language summary of the active filters** — e.g. _"Rolling from: Oscar winners · Drama · 1990s · Meryl Streep"_ — reads like a sentence, not a list of form fields; update live as filters change
- [ ] This summary line doubles as a shareable description — when the user clicks "Share these filters", the copied URL preview uses this sentence as the caption

### Roll Button Behaviour

- [ ] **The Roll button pulses with a subtle glow animation when filters are active** and there are results — reinforces that something is ready; stops pulsing when result count is 0
- [ ] **When Roll is clicked with active filters**, show a brief micro-animation before the result: a fast "Searching [N] films..." flicker (150ms) that gives the impression of the algorithm working, then the result snaps in — makes the randomness feel earned
- [ ] **The Roll button label changes based on filter state:**
  - No filters: _"Roll"_
  - Filters active: _"Roll from [N] films"_
  - Zero results: _"No matches"_ (disabled state)

### Empty State

- [ ] **Design a proper empty state for zero results** — not just red text; show: a large faded film reel or question mark icon, the personality copy from above, a "Clear all filters" primary button, and a _"or try a random film instead"_ secondary link that clears filters and rolls immediately
- [ ] Empty state animates in with Framer Motion when the count hits zero — doesn't just appear

### Mood Presets as Visual Cards

- [ ] **Display mood presets as horizontal scrollable cards** rather than plain text pills — each card has a blurred film poster as its background (random film from that preset's result set), the preset name in bold white text, and the result count in small text below (e.g. "312 films")
- [ ] Cards have a hover/tap scale effect (Framer Motion `whileHover={{ scale: 1.03 }}`)
- [ ] Active preset card gets a gold border ring to show it is selected
- [ ] The poster background changes each time the page loads (random from the preset's set) — makes the filter panel feel alive on every visit

### Filter Panel Open/Close

- [ ] **Filter panel opens and closes with a smooth spring animation** (Framer Motion `spring` with `stiffness: 300, damping: 30`) — never a hard show/hide toggle
- [ ] On mobile, filter panel slides up from the bottom as a sheet (not a dropdown) — feels native and intentional
- [ ] A subtle backdrop blur appears behind the mobile filter sheet

---

## 13. Internationalization (i18n)

The app auto-detects the user's language from their browser locale and renders the UI in that language. Users can switch to any supported language at any time, and their preference is remembered across sessions.

### Supported Languages (starter set)

English (`en`), Spanish (`es`), French (`fr`), German (`de`), Persian/Farsi (`fa`), Japanese (`ja`), Portuguese (`pt`).

### Setup & Configuration

- [ ] Install `next-intl` in frontend: `npm install next-intl --workspace=frontend`
- [ ] Create `frontend/messages/` directory with one JSON file per language: `en.json`, `es.json`, `fr.json`, `de.json`, `fa.json`, `ja.json`, `pt.json`
- [ ] Create `frontend/src/i18n/request.ts` to configure locale detection (reads `Accept-Language` header via `next-intl` middleware)
- [ ] Add `next-intl` middleware in `frontend/src/middleware.ts` to detect locale from browser headers and redirect to the appropriate locale prefix (e.g. `/en/...`, `/es/...`)
- [ ] Configure `next-intl` plugin in `next.config.js`
- [ ] Migrate `frontend/src/app/` to locale routing: move all pages under `src/app/[locale]/` (e.g. `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`, etc.)
- [ ] Wrap the root layout in `NextIntlClientProvider` so all components have access to translations
- [ ] Add `dir="rtl"` to the `<html>` root when the active locale is a right-to-left language (e.g. `fa`); add `dir="ltr"` for all others

### Language Detection & Persistence

- [ ] Primary detection: `next-intl` middleware reads the `Accept-Language` browser header
- [ ] Fallback: if the detected locale is not in the supported list, default to `en`
- [ ] On manual language switch, write the chosen locale to a cookie (e.g. `NEXT_LOCALE`) so it overrides browser detection on return visits
- [ ] Verify priority order: cookie → `Accept-Language` → default `en`

### Language Switcher Component

- [ ] Create `src/components/LanguageSwitcher.tsx` — a dropdown listing all supported languages with their native names (e.g. "Español", "Français", "فارسی")
- [ ] Show the currently active language
- [ ] On selection, set the `NEXT_LOCALE` cookie and navigate to the same page under the new locale prefix (use `useRouter` + `usePathname` from `next-intl`)
- [ ] Add `LanguageSwitcher` to the site header / navigation bar

### Translation Files

- [ ] Create `messages/en.json` as the source of truth — organize keys by feature area:
  - `common` — shared labels (Save, Cancel, Loading, etc.)
  - `nav` — navigation links (Home, Browse, Profile, Sign in, Sign out)
  - `home` — Roll button, "Pick of the Day" heading, filter section labels
  - `filters` — all pill labels, dropdown placeholders, input placeholders, active chip labels, "Clear all" button
  - `browse` — result count text ("N films match your filters"), pagination, empty states
  - `film` — section headings (Awards, Cast, etc.), rating labels, "Roll again" button
  - `auth` — sign-in prompt, button labels
  - `watchlist` — headings, stat labels, empty states, action buttons
  - `profile` — user greeting, recommendation headings, stats
  - `errors` — API error messages and toast notifications
- [ ] Translate all keys into each supported language file (`es.json`, `fr.json`, `de.json`, `fa.json`, `ja.json`, `pt.json`)
- [ ] Replace every hardcoded UI string in existing components with `useTranslations()` hook calls

### SEO — Localized Metadata & Sitemap

- [ ] Export localized `generateMetadata` from each `[locale]` page so `<title>` and `<meta description>` are in the active language
- [ ] Update `sitemap.xml` to include locale-prefixed URLs (e.g. `/en/film/...`, `/es/film/...`) and add `<xhtml:link>` alternate tags for each language variant
- [ ] Add `<link rel="alternate" hreflang="...">` tags to the `<head>` for all locale variants of each page (helps Google serve the right language to the right user)

### Testing

- [ ] Auto-detection: open the app in a browser set to Spanish → UI should render in Spanish without any manual selection
- [ ] Fallback: set browser to an unsupported locale → UI falls back to English
- [ ] Language switcher: select French → page reloads in French, `NEXT_LOCALE` cookie is set to `fr`
- [ ] Persistence: reload page → French is still active (cookie overrides browser header)
- [ ] RTL layout: switch to Farsi → text flows right-to-left, layout mirrors correctly (no overflow or alignment issues)
- [ ] No hardcoded strings remain: search all component files for UI-facing string literals and confirm each is replaced with a `useTranslations()` call
- [ ] Verify `npm run type-check` still passes after all component changes

---

## 13.5. Rating Filters (IMDb & Rotten Tomatoes)

Add two range-slider filters to both the backend query layer and the frontend filter bar — one for IMDb rating (0–10) and one for Rotten Tomatoes score (0–100).

### Shared Types

- [ ] Add `imdbRatingMin`, `imdbRatingMax`, `rtScoreMin`, `rtScoreMax` (all `number`) to `FilterState` in `packages/types/src/index.ts`
- [ ] Rebuild the types package: `npm run build --workspace=packages/types`

### Backend

- [ ] Add `imdbRatingMin`, `imdbRatingMax` (coerced float, 0–10), `rtScoreMin`, `rtScoreMax` (coerced int, 0–100) to `listQueryBaseSchema` in `backend/src/lib/filmFilters.ts`
- [ ] Add WHERE clause conditions in `buildWhereClause`: when either bound is provided, add `"Film"."imdbRating" IS NOT NULL` (or `rtScore`) plus the range comparisons so null-rated films are excluded when a rating filter is active

### Frontend

- [ ] Update `filtersToParams` in `frontend/src/lib/api.ts` to serialize the four rating params to URL only when non-default (imdbRatingMin > 0, imdbRatingMax < 10, rtScoreMin > 0, rtScoreMax < 100)
- [ ] Add `DEFAULT_IMDB_MIN` (0), `DEFAULT_IMDB_MAX` (10), `DEFAULT_RT_MIN` (0), `DEFAULT_RT_MAX` (100) constants and the four fields to `DEFAULT_FILTERS` in `frontend/src/hooks/useFilters.ts`; include all four in `hasActiveFilters`
- [ ] Add IMDb range slider (step 0.5, shows "Any" at defaults) and RT range slider (step 5, shows "Any" at defaults) to `FilterBar` in `frontend/src/components/filter-bar.tsx`, placed after the Genre + Decade section
- [ ] Add active filter chips for IMDb (label: `IMDb 7–10`) and RT (label: `RT 70%–100%`) with individual remove handlers
- [ ] Make `DecadeRangeSlider` accept an optional `step` prop (default 10) so it can be reused for both rating sliders
- [ ] Parse `imdbRatingMin`, `imdbRatingMax`, `rtScoreMin`, `rtScoreMax` from URL search params in `filtersFromSearchParams` inside `frontend/src/components/browse-page-client.tsx`

---

## 13.6. Runtime Filter ("Quick Watch / Standard / Long Haul / Epic")

Four named pill buttons replacing a raw minutes slider — users think in mood and time available, not in numbers. Consistent with the existing award body and status pill design.

**Buckets:**
| Pill label | Runtime range | The feeling |
|---|---|---|
| Quick Watch | under 90 min | Weeknight, low energy |
| Standard | 90 – 130 min | Regular movie night |
| Long Haul | 130 – 180 min | Weekend, committed |
| Epic | 180 min + | Full event, nothing else planned |

### Shared Types

- [ ] Add `runtimeBucket` (`"quick" | "standard" | "longhaul" | "epic" | null`) to `FilterState` in `packages/types/src/index.ts`
- [ ] Rebuild the types package: `npm run build --workspace=packages/types`

### Backend

- [ ] Add `runtimeBucket` (optional enum string) to `listQueryBaseSchema` in `backend/src/lib/filmFilters.ts`
- [ ] In `buildWhereClause`, map each bucket to a Prisma `runtime` range condition:
  - `"quick"` → `runtime < 90`
  - `"standard"` → `runtime >= 90 && runtime < 130`
  - `"longhaul"` → `runtime >= 130 && runtime < 180`
  - `"epic"` → `runtime >= 180`
- [ ] Films with `runtime = null` are excluded whenever any bucket is active (same pattern as rating filters)
- [ ] Apply the same `runtimeBucket` param to `/api/random` so Roll respects the filter

### Frontend

- [ ] Add `runtimeBucket: null` to `DEFAULT_FILTERS` in `frontend/src/hooks/useFilters.ts`; include it in `hasActiveFilters`
- [ ] Add `runtimeBucket` to `filtersToParams` in `frontend/src/lib/api.ts` (omit from URL when null)
- [ ] Add `runtimeBucket` parsing in `filtersFromSearchParams` inside `frontend/src/components/browse-page-client.tsx`
- [ ] Add the four pill buttons to `FilterBar` in `frontend/src/components/filter-bar.tsx`, placed after the Award Year filter — label: **Quick Watch · Standard · Long Haul · Epic**; only one can be active at a time (selecting a new one deselects the previous); clicking the active pill deselects it
- [ ] Show a small runtime hint under each pill on hover/focus: "under 90 min", "90–130 min", "130–180 min", "180 min+"
- [ ] Add an active filter chip when a bucket is selected — label uses the pill name: `Quick Watch` with an × to remove
- [ ] Update the "Rolling from N films" live counter to reflect the runtime filter like all other filters

---

## 14. Frontend — Pages & Routing

- [ ] Create `src/app/layout.tsx` (root layout with navigation)
- [ ] Create `src/app/page.tsx` (home page with Roll feature)
- [ ] Create `src/app/browse/page.tsx` (browse and search page)
- [ ] Create `src/app/film/[slug]/page.tsx` (individual film detail page)
- [ ] Create `src/app/not-found.tsx` (404 page when film not found)
- [ ] Create `src/app/error.tsx` (error boundary for unexpected errors)
- [ ] Add navigation menu with links to Home, Browse
- [ ] Add theme toggle button (dark/light mode) in header
- [ ] Add footer or equivalent website UI disclosure text: "Award data is collected from publicly available award records. This project is an educational portfolio project and is not affiliated with the Academy Awards, Oscars, Golden Globes, TMDB, IMDb, or OMDb."
- [ ] Persist theme preference to localStorage and read it on page load (no flash of wrong theme)
- [ ] Create `src/hooks/useFilters.ts` custom hook to manage filter state and URL sync
- [ ] Create `src/lib/api.ts` API client wrapper with:
  - Base URL configuration
  - Error handling
  - Type-safe response parsing
  - Retry logic for failed requests

---

## 15. Auth & User System

This section must be completed before building watchlist/history (section 16) and profile (section 17), as both depend on authenticated user identity.

### 14a. Backend — Auth Models

- [ ] Add `User` model to `backend/prisma/schema.prisma`: id, email (unique), name, image, provider (e.g. "google"), providerId, createdAt, updatedAt
- [ ] Add `Account` and `Session` models required by Auth.js Prisma adapter
- [ ] Run Prisma migration: `npm run db:migrate --workspace=backend` (name: `add-auth-models`)
- [ ] Regenerate Prisma client: `npm run db:generate --workspace=backend`
- [ ] Add `NEXTAUTH_SECRET` to `backend/.env` (used to verify JWTs passed from frontend)
- [ ] Create `backend/src/middleware/auth.ts` — middleware that reads the `Authorization: Bearer <token>` header, verifies the Auth.js JWT using `NEXTAUTH_SECRET`, and attaches `req.userId` to the request; returns 401 if token is missing or invalid
- [ ] Apply auth middleware to all `/api/user/*` and `/api/recommendations` routes

### 14b. Frontend — Auth.js Setup (Email Verification + Google OAuth)

**Email strategy:** Use **Resend** (free tier: 3,000 emails/month) as the email provider. Auth.js Email provider sends a 6-digit verification code on sign-up/sign-in. Completely free and works for portfolio scale.

- [ ] Install `next-auth` (Auth.js v5) in frontend: `npm install next-auth --workspace=frontend`
- [ ] Install `@auth/prisma-adapter` in frontend
- [ ] Install Resend SDK: `npm install resend --workspace=frontend`
- [ ] Create a free account at resend.com; get API key; verify a sender domain (or use Resend test domain for development)
- [ ] Create `src/auth.ts` — configure Auth.js with:
  - **Email provider** — sends a 6-digit OTP code via Resend; user enters code on a verification page; this is the primary auth method and verifies the email address
  - **Google OAuth provider** (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`) — optional fast sign-in; Google already verifies the email
  - Prisma adapter pointing to the shared Neon database
  - JWT strategy (so tokens can be forwarded to the Express backend)
- [ ] Add Auth.js `VerificationToken` model to Prisma schema (required for email OTP): token, identifier, expires
- [ ] Run Prisma migration: `add-verification-token`
- [ ] Create `src/app/api/auth/[...nextauth]/route.ts` — Next.js route handler that delegates to Auth.js
- [ ] Create `src/lib/email.ts` — Resend client wrapper; `sendVerificationCode(to, code)` sends a branded HTML email with the 6-digit code
- [ ] Add env vars to `frontend/.env.local`: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY`, `EMAIL_FROM`
- [ ] Create OAuth credentials in Google Cloud Console (redirect URI: `http://localhost:3000/api/auth/callback/google`)
- [ ] Create `src/app/auth/signin/page.tsx` — two options: email input ("Send me a code") + "Continue with Google" button
- [ ] Create `src/app/auth/verify/page.tsx` — 6-box OTP input; auto-submits when all 6 digits filled; "Resend code" link after 60 seconds
- [ ] Create `src/components/AuthButton.tsx` — shows "Sign In" + "Sign Up" buttons when logged out; shows avatar + menu when logged in
- [ ] Add `AuthButton` to the site header / navigation bar
- [ ] Create `src/lib/apiWithAuth.ts` — forwards Auth.js JWT in `Authorization` header for protected backend calls
- [ ] Test email sign-up: enter email → receive 6-digit code → enter code → session created, email verified
- [ ] Test Google sign-up: OAuth flow → session created
- [ ] Confirm unverified emails cannot access protected routes

---

## 16. Watchlist & Watch History

Depends on: section 15 (auth must be working before this section).

### 15a. Backend — Database Models

- [ ] Add `Watchlist` model to `backend/prisma/schema.prisma`: id, userId (FK → User), filmId (FK → Film), addedAt; unique constraint on (userId, filmId)
- [ ] Add `WatchedFilm` model to `backend/prisma/schema.prisma`: id, userId (FK → User), filmId (FK → Film), watchedAt, doNotSuggest (Boolean, default false); unique constraint on (userId, filmId)
- [ ] Run Prisma migration: `npm run db:migrate --workspace=backend` (name: `add-watchlist-watched`)
- [ ] Regenerate Prisma client

### 15b. Backend — API Routes

- [ ] Create `backend/src/routes/user.ts` with the following endpoints (all require auth middleware):
  - [ ] GET /api/user/watchlist — return the authenticated user's watchlist with film summaries
  - [ ] POST /api/user/watchlist — add a film to watchlist; body: `{ filmId: string }`; return 409 if already saved
  - [ ] DELETE /api/user/watchlist/:filmId — remove a film from watchlist
  - [ ] GET /api/user/watched — return the authenticated user's watched films
  - [ ] POST /api/user/watched — mark a film as watched; body: `{ filmId: string, doNotSuggest: boolean }`; upsert (update if already exists)
  - [ ] DELETE /api/user/watched/:filmId — remove a film from watched history
- [ ] Update GET /api/random: when `userId` query param is provided (and verified by auth middleware), exclude films where that user has `doNotSuggest=true`
- [ ] Mount user routes in `backend/src/app.ts` under `/api/user`
- [ ] Test all user routes with Postman (include JWT in Authorization header)

### 15c. Frontend — Post-Roll Action Buttons

After every roll result, show quick-action buttons immediately below the film card.

- [ ] Render **two primary quick buttons** visible immediately after roll:
  - **"Not Interested"** (thumbs-down / X icon) — marks film so it won't appear in future rolls for this user
  - **"Watched"** (checkmark icon) — marks film as watched
- [ ] Also render **"Save to Watchlist"** (bookmark icon) as a secondary button
- [ ] If the user is **not logged in**: clicking any button opens a sign-in prompt modal ("Sign in to track what you've seen") with a link to `/auth/signin`
- [ ] If the user **is logged in**:
  - "Not Interested" calls POST /api/user/watched with `doNotSuggest: true`; show confirmation toast; film is excluded from future rolls
  - "Watched" opens an inline confirmation with optional "Don't suggest again" toggle, then calls POST /api/user/watched
  - "Save to Watchlist" calls POST /api/user/watchlist; icon changes to filled/active state on save
- [ ] On mount, check existing watchlist/watched state and show correct icon states
- [ ] Handle loading spinners and error toasts for all API calls
- [ ] Show the same action buttons on film detail pages (`/film/[slug]`) as well

### 15d. Frontend — Watchlist Page

- [ ] Create `src/app/profile/watchlist/page.tsx` — protected page (redirect to `/auth/signin` if not logged in)
- [ ] Fetch and display the user's watchlist as a responsive film grid
- [ ] Each card shows poster, title, year, award summary, and a "Remove" button
- [ ] Clicking a card navigates to the film detail page
- [ ] Show empty state: "Your watchlist is empty — roll some films to get started"
- [ ] Add a link to the watchlist page in the site header user menu (visible only when logged in)

---

## 16b. Custom Lists (Beyond Watchlist)

Users can create unlimited named lists — e.g. "Watch with Mom", "Best of the 90s", "Film school homework". Same data model as Watchlist, with an added list name.

### Backend

- [ ] Add `UserList` model to Prisma: id, userId (FK→User), name (String), createdAt
- [ ] Add `UserListEntry` model: id, listId (FK→UserList), filmId (FK→Film), addedAt; unique on (listId, filmId)
- [ ] Run Prisma migration: `add-custom-lists`
- [ ] Routes (all require auth):
  - [ ] GET /api/user/lists — return all lists for the current user (name, film count, last updated)
  - [ ] POST /api/user/lists — create a new list; body: `{ name: string }`; max 50 chars; max 20 lists per user
  - [ ] DELETE /api/user/lists/:id — delete a list and all its entries
  - [ ] PATCH /api/user/lists/:id — rename a list; body: `{ name: string }`
  - [ ] GET /api/user/lists/:id — return all films in a list (paginated)
  - [ ] POST /api/user/lists/:id/films — add a film to a list; body: `{ filmId: string }`
  - [ ] DELETE /api/user/lists/:id/films/:filmId — remove a film from a list

### Frontend

- [ ] On film detail page and after a roll, add "Save to list" button — opens a dropdown showing all the user's lists + "Create new list" option
- [ ] Create `src/app/profile/lists/page.tsx` — shows all the user's lists as cards (list name, film count, last 3 poster thumbnails as preview)
- [ ] Create `src/app/profile/lists/[id]/page.tsx` — shows all films in a list with remove buttons; rename and delete list controls at the top
- [ ] Empty state: "You haven't created any lists yet — save a film to get started"
- [ ] Add "My Lists" link to the profile navigation

---

## 17. Profile & Personalized Recommendations

Depends on: sections 15 and 16 (auth + watchlist/history data must exist to generate recommendations).

### 16a. Backend — Recommendations API

- [ ] Create `backend/src/routes/recommendations.ts` (requires auth middleware)
- [ ] GET /api/recommendations — generate and return personalized film suggestions:
  - Collect genres, directors, and award categories from the user's watchlist + watched films (excluding `doNotSuggest`)
  - Score each film in the database that is **not** in watchlist and **not** watched by how many of those collected dimensions it matches (genre match +2, director match +3, award category match +1)
  - Exclude any film where the user has `doNotSuggest=true`
  - Sort by score descending, tiebreak on total award wins
  - Return top 3 recommendations as film summaries
- [ ] If the user has fewer than 3 films in history + watchlist combined, return a specific `ApiError` code (e.g. `NOT_ENOUGH_DATA`) so the frontend can show an appropriate prompt
- [ ] Mount recommendations route in `backend/src/app.ts` under `/api/recommendations`
- [ ] Test with a seeded user that has watchlist entries: verify recommendations exclude watched/saved films and match expected genres/directors

### 16b. Frontend — Profile Page

- [ ] Create `src/app/profile/page.tsx` — protected page (redirect to `/auth/signin` if not logged in)
- [ ] Display user greeting: avatar, name, and a brief summary row:
  - "X films in watchlist · Y films watched · Z excluded from rolls"
- [ ] **Personalized Recommendations section** — this is distinct from Pick of the Day (which is manual/global); these are unique to the user:
  - Call GET /api/recommendations on page load
  - Display exactly 3 film cards based on the user's taste
  - If `NOT_ENOUGH_DATA` error returned: show prompt "Roll and save a few more films to unlock your personalized picks"
  - Each recommendation card links to the film detail page
- [ ] **Quick-access links**: "View Watchlist →", "View Watched History →"
- [ ] Add a `/profile` link in the navigation header (visible only when logged in)
- [ ] Protect the route server-side with Auth.js `auth()` helper — render nothing and redirect if no session

---

## 17b. User Ratings for Watched Films

- [ ] Add `UserRating` model to Prisma schema: id, userId (FK→User), filmId (FK→Film), rating (Float — 1.0 to 10.0 in 0.5 steps, e.g. 7.5), createdAt, updatedAt; unique on (userId, filmId)
- [ ] Run Prisma migration: `add-user-ratings`
- [ ] Backend route (requires auth):
  - [ ] POST /api/user/ratings — upsert a rating; body: `{ filmId, rating }`; validate: rating must be a multiple of 0.5 between 1.0 and 10.0; return 400 otherwise
  - [ ] GET /api/user/ratings/:filmId — get current user's rating for a film
  - [ ] DELETE /api/user/ratings/:filmId — remove rating
- [ ] Calculate and expose **average rating** per film on the film detail endpoint (aggregate from all users)
- [ ] Frontend — Film Detail Page:
  - [ ] Show average rating (star display) from all users
  - [ ] If logged in and has watched the film, show interactive **half-star rating widget (1–10, step 0.5)**; pre-fill their existing rating
  - [ ] If not logged in, show read-only average rating with "Sign in to rate" prompt
- [ ] Frontend — Film cards in browse grid optionally show average star rating badge

---

## 17c. Film Comments (Authenticated Users)

Logged-in users who have watched a film can leave a comment on its detail page.

### Backend

- [ ] Add `FilmComment` model: id, userId (FK→User), filmId (FK→Film), body (Text), createdAt, updatedAt
- [ ] Run Prisma migration: `add-film-comments`
- [ ] Routes (all require auth except GET):
  - [ ] GET /api/films/:slug/comments — return paginated comments (20 per page) with user name + avatar; public, no auth required
  - [ ] POST /api/films/:slug/comments — create comment; body: `{ body: string }`; max 1000 chars; require auth
  - [ ] DELETE /api/films/:slug/comments/:id — delete own comment only; require auth + ownership check

### Frontend

- [ ] Film detail page — Comments section below awards:
  - [ ] Fetch and display comments list (name, avatar, date, body)
  - [ ] If logged in: show text area + "Post Comment" button
  - [ ] If not logged in: show "Sign in to comment" prompt
  - [ ] Optimistically add new comment to list on submit; revert on error
  - [ ] Show delete button only on the user's own comments
  - [ ] Paginate if more than 20 comments

---

## 17d. Feedback / Suggestions Section (Public Footer Form)

A public-facing section at the bottom of every page where anyone can write ideas, bug reports, or general suggestions.

### Backend

- [ ] Add `SiteFeedback` model: id, email (optional String), body (Text), createdAt
- [ ] Run Prisma migration: `add-site-feedback`
- [ ] POST /api/feedback — public endpoint (no auth required); body: `{ email?: string, body: string }`; max 2000 chars; return 201 on success
- [ ] On successful submission, **send an email notification to the site owner** via Resend with the feedback body and submitter email if provided
- [ ] Add `RESEND_API_KEY` and `OWNER_EMAIL` to `backend/.env`
- [ ] Basic rate limiting on this endpoint (max 5 submissions per IP per hour) to prevent spam

### Frontend

- [ ] Add a **"Share Your Thoughts"** section at the very bottom of every page (before the copyright footer)
- [ ] Show a simple form: optional email field + multiline message textarea + "Send" button
- [ ] On success: replace form with "Thanks for your feedback!" message
- [ ] On error: show error toast; keep form filled so user doesn't lose text

---

## 17e. Completionist Tracker

Gamification on the profile page — progress bars for how many films the user has seen within each award category.

### Backend

- [ ] Create GET /api/user/progress — for the authenticated user, return:
  - Total Oscar Best Picture nominees in dataset vs how many the user has watched
  - Same for Best Director, Best Actress, Best Actor, Best Animated Feature, Palme d'Or, GG Best Drama, etc.
  - Overall: "X of Y total films in dataset watched"
- [ ] This is a pure read query — join WatchedFilm with Film's award category data; no new models needed

### Frontend

- [ ] Add a "Completionist" section to the profile page
- [ ] Display progress bars for each tracked category:
  - Label: "Best Picture nominees" · Progress: "23 / 96" · Bar: filled proportionally
  - Categories shown: Best Picture, Best Director, Best Actress, Best Actor, Best Animated Feature, Palme d'Or, GG Best Drama Film
- [ ] Overall progress bar at the top: "You've seen X% of all award-nominated films in CineRoll"
- [ ] Clicking a category bar → links to `/browse` pre-filtered to that category with watched films highlighted or excluded
- [ ] Animate the progress bars on page load (fill from 0 to current value) for visual delight

---

## 17f. CineRoll Wrapped

Any time a logged-in user clicks "Generate My Wrapped", they get a personal stats card showing their CineRoll activity. Shareable as an image. High viral potential.

### Backend

- [ ] Create GET /api/user/wrapped — authenticated; return:
  - Total films rolled (all time)
  - Total films watched (marked as watched)
  - Top 3 genres by watch count
  - Top director (most films watched)
  - Rarest film found (fewest total nominations in their watched list)
  - Total award wins across all watched films combined
  - Completionist highlight: highest-progress award category (e.g. "71% of Best Picture nominees")
  - "Film of the year" — their highest-rated film

### Frontend

- [ ] Add "Generate My Wrapped" button on the profile page
- [ ] Animate the stats card building up section by section (like Spotify Wrapped) using Framer Motion
- [ ] Final card shows all stats in a visually bold, dark-themed layout with the CineRoll logo
- [ ] **"Share my Wrapped"** button: uses `/api/og/wrapped/:userId` to generate a shareable image card; opens native share sheet on mobile, copies link on desktop
- [ ] The shared Wrapped page (`/wrapped/:userId`) is publicly viewable — shows the user's stats with a "Create yours" CTA that drives signups

---

## 17g. Public Taste Profile (`/u/:username`)

Every user gets a public shareable profile page showing their film taste. Like a Letterboxd profile but built entirely on award data.

### Backend

- [ ] Add `username` (String, unique, nullable) and `profilePublic` (Boolean, default true) fields to the `User` Prisma model
- [ ] Run Prisma migration: `add-username-public-profile`
- [ ] Create GET /api/users/:username — return public profile data: display name, avatar, watch stats, top genres, top directors, recent ratings, public lists; return 404 if user not found or `profilePublic = false`
- [ ] Add PATCH /api/user/profile route (auth required): update username and profilePublic toggle

### Frontend

- [ ] Create `src/app/u/[username]/page.tsx` — server-rendered for SEO
- [ ] Display: avatar, username, join date, stat row ("X films watched · Y lists · Z ratings")
- [ ] "Taste fingerprint" section: top 3 genres, top 3 directors, favorite award body
- [ ] Recent ratings: last 5 films rated with star scores
- [ ] Public lists: show all public custom lists with film count and poster previews
- [ ] Completionist highlights: top 2 progress bars
- [ ] "Roll like [username]" button — rolls a random film from their watched/liked genres
- [ ] On the profile settings page: let user set a username and toggle profile public/private
- [ ] Add username field to the sign-up / onboarding flow

---

## 18. Admin Panel

A simple password-protected internal page for the site owner only. No user-facing features — purely operational.

### Backend

- [ ] Add `ADMIN_SECRET` to `backend/.env` — a long random string; admin routes check for this in the `Authorization` header
- [ ] Create `backend/src/routes/admin.ts` (all routes require `Authorization: Bearer <ADMIN_SECRET>`):
  - [ ] GET /api/admin/stats — return: total users, total rolls today / this week, top 10 most rolled films (all time), top 10 most watchlisted films, total feedback submissions unread
  - [ ] GET /api/admin/feedback — return all SiteFeedback entries paginated, newest first
  - [ ] DELETE /api/admin/feedback/:id — delete a feedback entry
  - [ ] GET /api/admin/pick-of-day — return today's algorithmically selected film (for preview)
  - [ ] POST /api/admin/pick-of-day/override — optionally override the algorithm for today with a specific filmId; body: `{ filmId: string }`
  - [ ] DELETE /api/admin/pick-of-day/override — remove override, revert to algorithm
- [ ] Mount admin routes in `backend/src/app.ts` under `/api/admin`

### Frontend

- [ ] Create `src/app/admin/page.tsx` — protected by checking `ADMIN_SECRET` cookie set at login
- [ ] Create `src/app/admin/login/page.tsx` — simple password input; on correct password set a `admin_token` cookie; redirect to `/admin`
- [ ] Admin dashboard shows:
  - [ ] Stats cards: total users, rolls today, rolls this week
  - [ ] Top 10 most rolled films list
  - [ ] Today's Pick of the Day preview (algorithmic pick) + optional manual override search
  - [ ] Feedback inbox: list of submissions with email, message, date; delete button per entry
- [ ] Admin pages are excluded from public navigation and robots.txt

---

## 19. Stats & Discovery Page (`/stats`)

A public page surfacing interesting facts from the dataset. Great for SEO — unique text content Google can index that no other site has.

### Backend

- [ ] Create `backend/src/routes/stats.ts`:
  - [ ] GET /api/stats — return pre-computed stats object:
    - Most nominated person of all time (across Oscar + GG + Cannes)
    - Most winning person of all time
    - Film with the most nominations across all award bodies
    - Film with the most wins across all award bodies
    - Most competitive ceremony year (most total nominations)
    - Decade breakdown: average nominations per film per decade
    - Award body breakdown: total films in each (Oscar-only, GG-only, Cannes-only, multi-award)
    - Top 5 most-rolled films (from RollEvent table)
    - Top 5 most-watchlisted films
  - [ ] Cache this endpoint for 24 hours (changes rarely)
- [ ] Mount stats route in `backend/src/app.ts`

### Frontend

- [ ] Create `src/app/stats/page.tsx` — server-rendered for SEO
- [ ] Display stats in visual cards/sections:
  - [ ] "Most decorated person" — name, photo (TMDB), total wins
  - [ ] "Most awarded film" — poster, title, total wins across all bodies
  - [ ] "Most competitive year" — year, total nominations, top films that year
  - [ ] Decade timeline bar chart (simple CSS bars, no heavy chart library)
  - [ ] "Currently trending on CineRoll" — top 5 rolled + top 5 watchlisted this week
- [ ] Add `/stats` to main navigation
- [ ] Add structured data (JSON-LD) to the page for SEO
- [ ] Each stat card links to a pre-filtered browse view (e.g. clicking "Most competitive year: 1994" opens `/browse?awardYear=1994`)

---

## 19b. Weekly Community Challenge

Every Monday a new challenge is posted automatically. Users who complete it earn a badge. Creates weekly return visits.

### Backend

- [ ] Add `Challenge` model to Prisma: id, title, description, filterState (JSON — the filter combination that defines the challenge), startDate, endDate, badgeName
- [ ] Add `ChallengeCompletion` model: id, userId (FK→User), challengeId (FK→Challenge), completedAt; unique on (userId, challengeId)
- [ ] Seed initial 12 challenges (one per month as a rotation): e.g. "Watch a Cannes Palme d'Or winner", "Watch an Oscar Best Picture winner from before 1960", "Watch a film with 10+ nominations that won nothing"
- [ ] Create GET /api/challenges/current — return this week's active challenge + completion count + whether the current user has completed it
- [ ] Create POST /api/challenges/:id/complete (auth required) — mark challenge as completed; validate that the user has actually watched a film matching the challenge's filterState
- [ ] Weekly cron job: rotate to next challenge every Monday; send push notification + email to subscribers

### Frontend

- [ ] Add "Weekly Challenge" card on the home page — shows the challenge title, description, completion count ("142 people completed this"), and a "I watched one!" button
- [ ] Clicking "I watched one!" checks if the user has a watched film matching the challenge filters; if yes, marks complete and shows badge; if no, links to browse with the challenge filters pre-applied
- [ ] Challenge badge appears on the user's public profile page
- [ ] Challenge archive page (`/challenges`) shows all past challenges with completion counts

---

## 20. Weekly Email Pick (Opt-in Newsletter)

Users can subscribe to receive a "Film of the Week" email every Monday, automatically generated from the same algorithm as Pick of the Day.

### Backend

- [ ] Add `emailSubscribed` (Boolean, default false) and `emailSubscribedAt` fields to the `User` Prisma model
- [ ] Run Prisma migration: `add-email-subscription`
- [ ] Create `backend/src/routes/subscription.ts` (requires auth):
  - [ ] POST /api/user/subscribe — set `emailSubscribed = true` for current user
  - [ ] DELETE /api/user/subscribe — set `emailSubscribed = false` (unsubscribe)
- [ ] Create `backend/src/scripts/weeklyEmail.ts` — a script (not a route) that:
  - Runs every Monday via a cron job (e.g. Railway cron, or a simple `node-cron` job in the backend process)
  - Fetches this week's top film using the Pick of the Day algorithm
  - Fetches all users where `emailSubscribed = true`
  - Sends each subscriber a branded HTML email via Resend: film poster, title, award summary, a "Watch Now" link to the film detail page, and an unsubscribe link
  - Logs sent count and any failures

### Frontend

- [ ] Add "Get weekly picks in your inbox" toggle on the user profile page
- [ ] Toggle calls POST/DELETE /api/user/subscribe; show current subscription status
- [ ] Unsubscribe link in the email calls DELETE /api/user/subscribe (one-click, no login required — use a signed token in the URL)

---

## 21. Data Privacy & Security

**IMPORTANT — read this before committing any data files.**

If a file is added to `.gitignore` but was already committed to git history, anyone who clones the repo can still see it by checking the git log. The `.gitignore` only stops _future_ commits.

### How to ensure your data files are completely private

- [ ] Check whether data files were ever committed: `git log --all --full-history -- "backend/data/**"` — if output is empty, the files were never committed and `.gitignore` alone is enough
- [ ] If files _were_ committed, purge them from history using `git filter-repo --path backend/data --invert-paths` (install: `pip install git-filter-repo`)
- [ ] After purging, force-push the cleaned history: `git push --force-with-lease`
- [ ] Confirm `.gitignore` includes all data file patterns: `backend/data/*.xlsx`, `backend/data/*.json`, `backend/data/*.csv`
- [ ] Add a note in `SETUP.md` that raw data files must be obtained from the owner and placed in `backend/data/` manually — they are not in the repository
- [ ] Verify: clone the repo in a fresh directory and confirm `backend/data/` is empty

---

## 22. PWA & Mobile Homescreen Install

On mobile, show a friendly one-time prompt teaching users how to add CineRoll to their home screen so it opens like a native app.

- [ ] Create `public/manifest.json` with: name, short_name ("CineRoll"), icons (192px + 512px), theme_color, background_color, display: "standalone", start_url: "/"
- [ ] Create app icons in `public/icons/`: 192×192 and 512×512 PNG
- [ ] Add `<link rel="manifest">` and `<meta name="theme-color">` to the root layout `<head>`
- [ ] Add `<meta name="apple-mobile-web-app-capable" content="yes">` for iOS Safari support
- [ ] Add `<meta name="apple-mobile-web-app-status-bar-style">` and `<link rel="apple-touch-icon">` for iOS home screen icon
- [ ] **Mobile install banner** — detect first visit on mobile (localStorage flag `pwa-prompt-shown`):
  - [ ] Show a bottom-sheet or banner with step-by-step icons: "Tap the Share icon → tap 'Add to Home Screen' → tap Add" (with actual icons/images for iOS and Android separately)
  - [ ] Include a dismiss ("Maybe later") button; set the localStorage flag on dismiss or install so prompt never shows again
  - [ ] For Android: listen for the `beforeinstallprompt` event and show a custom "Install App" button; call `prompt()` on click
  - [ ] For iOS: detect `navigator.standalone === false` on Safari and show the manual steps banner
- [ ] Test on real iOS Safari and Android Chrome to confirm prompt appears correctly

### Push Notifications

- [ ] Request push notification permission after the user has been on the site for 30+ seconds (never on first load — too aggressive); show a soft in-app prompt first ("Get notified about your weekly film pick?") before triggering the browser permission dialog
- [ ] Backend: install `web-push` library in backend (`npm install web-push --workspace=backend`); generate VAPID key pair and add `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL` to `backend/.env`
- [ ] Add `PushSubscription` model to Prisma: id, userId (FK→User, nullable — allow anonymous subscriptions), endpoint (String, unique), p256dh (String), auth (String), createdAt
- [ ] Run Prisma migration: `add-push-subscriptions`
- [ ] Backend route (no auth required — subscriptions can be anonymous):
  - [ ] POST /api/push/subscribe — save a push subscription object; body: `{ subscription: PushSubscriptionJSON, userId?: string }`
  - [ ] DELETE /api/push/subscribe — remove a subscription by endpoint
- [ ] Frontend: create a service worker (`public/sw.js`) that handles the `push` event and shows the notification with title, body, icon, and a click URL
- [ ] Register the service worker in the root layout on mount
- [ ] **Weekly film pick notification** — in the `weeklyEmail.ts` script (Section 20), after sending emails also send a push notification to all subscribers: title "Your CineRoll Pick of the Week 🎬", body = film title + award summary, click → film detail page
- [ ] **New films notification** — after running the enrich/seed pipeline, if new films were added send a push: "X new films added to CineRoll — roll to discover them"
- [ ] Test: subscribe on desktop Chrome, trigger a test push from the backend, confirm notification appears

---

## 23. Deployment

### Frontend Deployment to Vercel

- [ ] Push repository to GitHub
- [ ] Create new Vercel project and connect GitHub repository
- [ ] Set root directory to `frontend/`
- [ ] Set framework to Next.js
- [ ] Configure environment variables: `NEXT_PUBLIC_API_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (production domain)
- [ ] Enable automatic deployments from main branch
- [ ] Setup custom domain (if desired) and configure DNS
- [ ] Verify SSL certificate is automatically provisioned
- [ ] Update Google OAuth redirect URI in Google Cloud Console to production domain
- [ ] Check Vercel analytics and performance monitoring
- [ ] Test: load home page, verify pick of day displays or shows fallback

### Backend Deployment to Railway

- [ ] Push repository to GitHub if not already done
- [ ] Create new Railway service and connect GitHub repository
- [ ] Set root directory to `backend/`
- [ ] Set build command to install dependencies and compile TypeScript
- [ ] Set start command to run compiled Node.js application
- [ ] Configure environment variables in Railway dashboard: `DATABASE_URL` (Neon connection), `PORT`, `FRONTEND_URL` (Vercel domain), `TMDB_API_KEY`, `OMDB_API_KEY`, `NEXTAUTH_SECRET`, `NODE_ENV`
- [ ] Trigger deploy and monitor logs for errors
- [ ] Verify health check endpoint: GET https://your-backend-url/health should return success
- [ ] Test API endpoints using Postman or curl

### Database Setup (Neon PostgreSQL)

- [ ] Create Neon PostgreSQL account and database
- [ ] Get connection string from Neon dashboard
- [ ] Use connection string as DATABASE_URL in backend
- [ ] Enable connection pooling in Neon (for better performance)
- [ ] Setup automated backups in Neon console
- [ ] Note restore procedure in case of emergency

### Post-Deployment Verification

- [ ] Verify frontend loads at https://your-vercel-domain
- [ ] Verify backend health check: GET https://your-railway-domain/health
- [ ] Test Roll feature end-to-end: click Roll, verify it calls backend and displays result
- [ ] Test Browse page: search for a film, verify results display
- [ ] Test film detail page: click a film card, verify detail page loads with all information
- [ ] Test filters: select genre and decade, verify results update
- [ ] Test dark mode toggle and verify it persists on page reload
- [ ] Test on mobile device: verify responsive layout looks good
- [ ] Test auth flow: sign in with Google, verify session persists, sign out
- [ ] Test watchlist: save a film, verify it appears in watchlist page, remove it
- [ ] Test "I've Watched This" + "Don't suggest again": mark a film, verify it no longer appears in rolls
- [ ] Test profile page: verify recommendations appear and "Roll from recommendations" works
- [ ] Setup monitoring and error tracking (e.g., Sentry)

---

## 24. Documentation

- [ ] Create `README.md` at repository root with:
  - Project overview and purpose
  - Live URL (Vercel frontend link)
  - Feature list
  - Tech stack
  - Architecture diagram or description
  - Local setup instructions (clone, install, run dev server)
  - Deployment instructions
  - Link to case study
- [ ] Create `ARCHITECTURE.md` explaining:
  - Monorepo structure and why it was chosen
  - Frontend architecture and routing
  - Backend API structure
  - Database schema overview
  - Data pipeline (Excel → Enrichment → Database → API → Frontend)
  - Auth system design (Auth.js + Prisma adapter + JWT forwarding to Express)
  - Why certain tech choices were made (Express vs Next.js API routes, PostgreSQL, Prisma, etc.)
- [ ] Create `DEPLOYMENT.md` with detailed steps for:
  - Frontend deployment to Vercel
  - Backend deployment to Railway
  - Database setup on Neon
  - Environment variables needed (including auth vars)
  - Health checks to verify deployment
- [ ] Create `API_DOCS.md` documenting all endpoints:
  - GET /api/films (with query parameters for filtering)
  - GET /api/films/:slug (with example response)
  - GET /api/random (with example response)
  - GET /api/pick-of-day (with example response and 404 case)
  - POST /api/roll (request/response format)
  - GET /api/user/watchlist (requires auth)
  - POST /api/user/watchlist (requires auth)
  - DELETE /api/user/watchlist/:filmId (requires auth)
  - GET /api/user/watched (requires auth)
  - POST /api/user/watched (requires auth)
  - GET /api/recommendations (requires auth)
  - All error responses and status codes
- [ ] Create `SETUP.md` with step-by-step local development instructions:
  - Clone repository
  - Install dependencies
  - Setup environment variables (.env files, including Google OAuth credentials)
  - Run database migrations
  - Seed database with films
  - Start dev server
  - Access at localhost:3000
- [ ] Create `DECISIONS.md` explaining key architectural choices:
  - Why use monorepo with npm workspaces instead of separate repos
  - Why Express backend instead of Next.js API routes
  - Why Neon PostgreSQL with Prisma instead of MongoDB
  - Why pg_trgm for typo-tolerant search (vs Algolia, Fuse.js, Typesense)
  - Why static generation + ISR for film detail pages
  - Why Auth.js with JWT forwarded to Express (vs duplicating auth in Express)
  - Performance and scalability considerations
- [ ] Create `CASE_STUDY.md` for portfolio:
  - Problem: Manual film discovery is tedious, IMDB is cluttered
  - Solution: Build CineRoll, a beautiful film discovery app with roll feature
  - Technical challenges: handling 2000+ films efficiently, typo-tolerant search, API integration, auth across Next.js + Express
  - How you solved them: database indexing, pg_trgm, monorepo structure, Auth.js JWT bridging
  - Results: fast app, good user experience, production-deployed
  - What you learned
- [ ] Add code comments to complex logic in frontend and backend
- [ ] Create `.github/pull_request_template.md` for future contributions

---

## 25. Performance & Lighthouse Audit

Run this section after the app is fully built and deployed. Lighthouse results on a live production URL are the only meaningful scores — dev server numbers are not valid.

### Image Optimization (Lighthouse Metric: LCP)

- [ ] Use Next.js Image component for all images (poster, backdrop, etc.) instead of HTML img tag
- [ ] Set explicit width and height on all Next.js Image components to prevent layout shift
- [ ] Configure image sizes in `next.config.js` to serve appropriately sized images for different breakpoints
- [ ] Use TMDB image optimization: prioritize small poster sizes, use thumbnail for initial load then higher resolution
- [ ] Add placeholder blur while images load (blurDataURL or placeholder="blur")
- [ ] Test: run Lighthouse, verify Largest Contentful Paint (LCP) is under 2.5 seconds

### Code Splitting & Bundle Size (Lighthouse Metric: FID/INP)

- [ ] Use dynamic imports for heavy components (FilmModal, FilmDetail, etc.) with React.lazy()
- [ ] Use Suspense boundaries with loading fallbacks for dynamic imports
- [ ] Split API calls: don't load unnecessary data on initial page load
- [ ] Defer non-critical JavaScript: analytics, tracking scripts should load after hydration
- [ ] Remove unused dependencies: audit package.json for unused packages
- [ ] Check bundle size: use `next/bundle-analyzer` or similar tool
- [ ] Target: keep main bundle under 200KB gzipped, all chunks under 250KB gzipped
- [ ] Test: run Lighthouse, verify First Input Delay (FID) under 100ms

### CSS & Layout Stability (Lighthouse Metric: CLS)

- [ ] Minimize CSS using Tailwind CSS (production build automatically purges unused styles)
- [ ] Avoid inline styles; use Tailwind classes instead
- [ ] Set explicit dimensions (width/height) on all media elements to prevent Cumulative Layout Shift (CLS)
- [ ] Test: run Lighthouse, verify CLS score (should be near 0)

### Font Optimization (Lighthouse Metric: LCP)

- [ ] Use system fonts or preload Google Fonts in `next.config.js`
- [ ] Use `font-display: swap` for custom fonts to prevent blank text (FOIT)
- [ ] Limit fonts: maximum 2-3 font families for production
- [ ] Use variable fonts to reduce file size

### Accessibility (Lighthouse Metric: Accessibility Score)

- [ ] Audit color contrast ratios: ensure minimum 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- [ ] Use semantic HTML: proper heading hierarchy (h1, h2, h3), use `<button>` for buttons, `<a>` for links
- [ ] Add ARIA labels to interactive elements (buttons, form inputs, modals)
- [ ] Implement keyboard navigation: Tab through all interactive elements, Enter/Space to activate
- [ ] Test with screen reader: navigate entire page using keyboard only
- [ ] Ensure all images have alt text
- [ ] Ensure focus indicators are visible (don't remove default outline)
- [ ] Test: run axe DevTools extension, fix all accessibility violations

### SEO (Lighthouse Metric: SEO Score)

- [ ] Add page titles: unique title for each page
- [ ] Add meta descriptions: unique description for each page (under 160 characters)
- [ ] Add Open Graph tags: og:title, og:description, og:image for social sharing
- [ ] Add Twitter Card tags: twitter:card, twitter:title, twitter:description for Twitter sharing
- [ ] Use semantic HTML headings: one h1 per page, proper h2/h3 hierarchy
- [ ] Create robots.txt (allow search engines to crawl)
- [ ] Create sitemap.xml (list all pages for search engines)
- [ ] Add canonical tags if needed (prevent duplicate content)
- [ ] Test: run Lighthouse, verify SEO score is 90+

### Best Practices (Lighthouse Metric: Best Practices)

- [ ] Set security headers: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- [ ] No console errors or warnings in browser console
- [ ] Use CSP (Content Security Policy) headers
- [ ] Avoid deprecated APIs
- [ ] Test: run Lighthouse, verify Best Practices score is 90+

### Lighthouse Testing & Iteration

- [ ] Run Lighthouse audit on the live production URL for each page: home, browse, film detail, profile
- [ ] Target scores: Performance 90+, Accessibility 90+, Best Practices 90+, SEO 90+
- [ ] Test on mobile and desktop separately (mobile is usually stricter)
- [ ] Monitor on slow connections: test with Chrome DevTools throttling (Slow 4G)
- [ ] Use WebPageTest or similar tool for real-world performance testing
- [ ] Set up CI/CD to fail builds if Lighthouse scores drop below threshold
- [ ] Document any unavoidable performance trade-offs and why

---

## ✅ Success Verification Checklist

- [ ] All npm workspace dependencies install successfully
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Development server runs: `npm run dev` starts both backend and frontend
- [ ] Database is seeded with 2000+ films

### Roll (no filters)

- [ ] Frontend home page loads and Roll returns a random film with no filters active

### Award Filtering (core feature)

- [ ] Searching a person name (e.g. "Meryl Streep") returns only films she was nominated or awarded for
- [ ] Searching a director name returns only films they directed that are in the award dataset
- [ ] Selecting "Oscar only" hides films that only have Golden Globe data and vice versa
- [ ] "Won only" filter returns films with at least one win in the selected award body
- [ ] Selecting a category (e.g. "Best Actress in a Leading Role") filters to films with a record in that category
- [ ] Selecting a ceremony year (e.g. 1994) returns only films nominated/won at that specific ceremony
- [ ] All filters combine correctly: person + award body + win status + category + ceremony year all active simultaneously
- [ ] Active filter chips display and each can be removed individually
- [ ] Filter state persists in URL and can be shared/bookmarked

### Filtered Roll

- [ ] With filters active, Roll picks a random film from within the filtered result set
- [ ] "Roll from N films" label updates as filters change
- [ ] Roll is disabled and shows message when filtered set is empty

### Browse & Detail

- [ ] Browse page loads, paginated grid shows with loading skeletons
- [ ] Film detail page displays complete Oscar and Golden Globe history broken down by category and year
- [ ] Dark mode toggle works and persists on page reload
- [ ] All pages are responsive on mobile, tablet, and desktop

### Auth

- [ ] Sign in with Google redirects to Google OAuth and returns a valid session
- [ ] Sign out clears the session and hides the profile/watchlist links
- [ ] Unauthenticated requests to /api/user/\* return 401

### Watchlist & Watch History

- [ ] Logged-in user can save a film to watchlist; bookmark icon changes to filled state
- [ ] Logged-in user can mark a film as watched with "don't suggest again"; film no longer appears in subsequent rolls
- [ ] Watchlist page displays all saved films and allows removal
- [ ] Not-logged-in user clicking save/watched sees a sign-in prompt

### Profile & Recommendations

- [ ] Profile page loads with correct stats (watchlist count, watched count)
- [ ] 3 personalized recommendations are shown and are distinct from the global Pick of the Day
- [ ] Visiting /profile while logged out redirects to sign-in page

### Backend

- [ ] Backend API returns proper error responses for invalid requests
- [ ] GET /api/films/categories returns distinct category list
- [ ] GET /api/films/award-years returns sorted ceremony year list

### Deployment

- [ ] Deployment to Vercel and Railway succeeds with no build errors
- [ ] Frontend and backend are properly configured with environment variables
- [ ] Health check endpoint responds successfully
- [ ] Documentation is complete and accurate
- [ ] Case study is written and portfolio-ready

---

## 📊 Performance & Quality Targets

- Lighthouse score: 90+ on all pages
- API response time: < 200ms for search queries
- Database query time: < 100ms
- Frontend bundle size: < 250KB gzipped
- Page load time: First Contentful Paint < 2 seconds
- Code coverage: > 70% (aim for > 80%)
- Accessibility: WCAG AA compliance

---

---

## 26. Google Search Ranking (SEO)

Run this section after deployment. These steps go beyond Lighthouse's basic SEO score and target actual Google ranking for searches like "oscar nominated films filter", "random award winning movie", "golden globe movies by actor", etc.

> **Target queries** — ranking #1 for "Oscar movies" is impossible (IMDb/Wikipedia own it). Focus on long-tail queries where CineRoll is unique: _"filter oscar films by actor"_, _"random golden globe winning movie"_, _"oscar nominated films by year and category"_. No major site does what CineRoll does — that's your SEO moat.

### Priority Order — Do These in Sequence

#### Phase 1 — Before Google Can Help You At All

- [ ] **Deploy to a real domain** — Google won't seriously index `localhost` or Vercel preview URLs
- [ ] **Generate `sitemap.xml`** — use `next-sitemap` package, covers home + browse + all `/film/[slug]` pages
- [ ] **Submit to Google Search Console** — verify ownership, submit sitemap, request indexing
- [ ] **Enable ISR on film detail pages** — without this, Googlebot hits your backend cold every crawl and may time out

#### Phase 2 — Make Google Understand Your Pages

- [ ] **Keyword-rich `<title>` tags** — see "Page Content" section below for exact templates
- [ ] **`og:image` + `meta description`** on every page — also needed for Product Hunt and social sharing
- [ ] **Movie JSON-LD schema** on film detail pages — gives you star ratings in search snippets, a huge CTR boost
- [ ] **Unique text content on film pages** — plot summary + full award history in readable text, not just images; thin pages don't rank

#### Phase 3 — Build Authority Over Time

- [ ] **Internal linking** — footer links to top filter combos ("Best Picture winners", "Coen Brothers films"), related films on every detail page
- [ ] **Backlinks** — dev.to article, Hacker News "Show HN", Reddit r/movies, your portfolio; each one tells Google you're real
- [ ] **Google Analytics 4** — track which queries bring traffic, double down on those

#### Realistic Timeline

| Timeframe          | What happens                                     |
| ------------------ | ------------------------------------------------ |
| Day 1 after deploy | Submit sitemap, request indexing                 |
| Week 2–4           | Google starts crawling your pages                |
| Month 2–3          | Film detail pages start appearing in search      |
| Month 4–6          | Long-tail queries where you're unique hit page 1 |

---

### Structured Data — Help Google Understand Your Content

- [ ] Add **Movie schema** (JSON-LD) to every film detail page: title, description, dateCreated, genre, director, actor, aggregateRating (IMDB score). This enables rich results in Google (star ratings shown in search snippets)
- [ ] Add **BreadcrumbList schema** to film detail pages so Google shows breadcrumb paths in results (e.g. CineRoll › Browse › The Godfather)
- [ ] Add **WebSite schema** with a `SearchAction` on the home page so Google can surface a sitelinks search box directly in search results
- [ ] Add **FAQPage schema** on the home/browse page with questions like "How do I find Oscar-winning films by actor?" to capture featured snippet real estate
- [ ] Test all structured data using Google's Rich Results Test — fix any errors before going live
- [ ] Validate with Schema.org Validator as well

### Google Search Console — Submit & Monitor

- [ ] Create a Google Search Console property and verify ownership (add verification meta tag or DNS TXT record)
- [ ] Submit your `sitemap.xml` in Search Console → Sitemaps
- [ ] Request indexing for the home page, browse page, and a sample film page via URL Inspection tool
- [ ] Monitor the Coverage report weekly for crawl errors or pages blocked by robots.txt
- [ ] Check the Core Web Vitals report in Search Console — it shows field data from real users, not just Lighthouse lab data
- [ ] Set up email alerts in Search Console for manual actions or security issues

### Sitemap — Make Every Page Discoverable

- [ ] Generate a dynamic `sitemap.xml` from Next.js that includes: home, browse, and all `/film/[slug]` pages (use `generateSitemaps` in App Router or a next-sitemap package)
- [ ] Include `<lastmod>` dates in the sitemap so Google knows when pages were last updated
- [ ] Split into sitemap index if there are over 1000 film pages
- [ ] Reference the sitemap in `robots.txt`: `Sitemap: https://yourdomain.com/sitemap.xml`
- [ ] Ping Google after deploy: `https://www.google.com/ping?sitemap=https://yourdomain.com/sitemap.xml`

### Page Content — Give Google Something to Rank

- [ ] Each film detail page must have unique text content beyond just metadata — include full plot, full award history, cast list. Thin pages don't rank.
- [ ] Write keyword-rich `<title>` tags for each page type:
  - Home: "CineRoll — Roll a Random Award-Winning Film | Oscar & Golden Globe Filter"
  - Browse: "Browse Oscar & Golden Globe Films — Filter by Actor, Category, Year | CineRoll"
  - Film detail: "[Film Title] ([Year]) — Oscar & Golden Globe History | CineRoll"
- [ ] Write unique `<meta name="description">` for each page (150–160 chars), including the film's award count and a call to action
- [ ] Add an `<h1>` on every page that matches the primary keyword for that page — never leave it as a generic title
- [ ] On the browse/home page, add a short paragraph (100–150 words) explaining what CineRoll does, using natural language with keywords like "Oscar-nominated films", "filter by award year", "random Golden Globe winner"
- [ ] Add text-based award summaries on film cards in the browse grid (not just images) — Google can't read images

### Internal Linking — Connect Your Pages

- [ ] On every film detail page, link to related films: same director, same genre, same ceremony year (e.g. "Other 1994 Oscar nominees")
- [ ] From the home page, link to pre-filtered browse views: "Browse all Best Picture winners", "Browse Coen Brothers films"
- [ ] Add a footer with links to key browse filters (top genres, top decades, top categories)
- [ ] Ensure every film card in the browse grid links to the film's detail page with a descriptive anchor (film title, not "click here")

### URL & Crawlability

- [ ] Confirm all film slugs are human-readable and keyword-rich (e.g. `/film/the-godfather-1972`, not `/film/abc123`)
- [ ] Add `<link rel="canonical">` on every page to prevent duplicate content from URL parameter variations
- [ ] Ensure paginated browse pages use canonical or `rel="next"` / `rel="prev"` links so Google understands pagination
- [ ] Verify `robots.txt` allows crawling of all pages you want indexed; block `/api/*` to avoid indexing API routes
- [ ] Test crawlability with Google Search Console URL Inspection — confirm "Page is indexable"

### Mobile-First — Google Indexes Mobile Version

- [ ] Confirm no content is hidden on mobile that is visible on desktop — Google uses the mobile version for indexing
- [ ] Check that font sizes are readable on mobile without zooming (minimum 16px body text)
- [ ] Verify tap targets (buttons, links) are at least 48×48px on mobile
- [ ] Test with Google's Mobile-Friendly Test tool

### Performance as a Ranking Signal

- [ ] Achieve Core Web Vitals "Good" thresholds on mobile (from real field data, not just Lighthouse):
  - LCP < 2.5s
  - INP < 200ms
  - CLS < 0.1
- [ ] Enable ISR (Incremental Static Regeneration) for film detail pages in Next.js so they serve as fast static HTML to Googlebot
- [ ] Ensure TTFB (Time to First Byte) is under 600ms for the home page — slow TTFB directly hurts crawl budget

### Backlinks & Authority — Get Other Sites to Link to You

- [ ] Add the live URL to your GitHub profile and repository README
- [ ] Share on LinkedIn, Twitter/X, and any relevant communities (r/webdev, r/movies) — social signals help initial indexing
- [ ] Submit to portfolio aggregators and developer showcases (Hacker News "Show HN", Product Hunt, etc.)
- [ ] Write a short blog post or dev.to article about building CineRoll — link back to the site (content marketing + backlink)
- [ ] Add to your portfolio site with a descriptive link (not just "CineRoll" — use "Oscar & Golden Globe film discovery app")

### Bing & Other Search Engines

- [ ] Submit to **Bing Webmaster Tools** as well — Bing powers Yahoo and DuckDuckGo, adding meaningful traffic
- [ ] Verify site in Bing, submit sitemap, and check for crawl errors

### Ongoing Monitoring

- [ ] Check Google Search Console → Performance → Queries weekly to see which searches bring visitors
- [ ] Set up Google Analytics 4 to track organic traffic separately from direct/referral
- [ ] Monitor ranking for target queries using a free rank tracker (Google Search Console works for basic tracking)
- [ ] If a page ranks on page 2–3 for a relevant query, improve its content and internal links to push it to page 1

### og:image Global Strategy

- [ ] Set up `/api/og/film/[slug]` endpoint using `@vercel/og` to generate dynamic OG images for every film (backdrop + title + award count overlay, 1200×630px, < 100KB)
- [ ] Create a static branded og:image for the homepage (CineRoll logo + tagline on dark background, 1200×630px)
- [ ] Create og:image for person pages (TMDB person photo + name + award count overlay)
- [ ] Create static branded og:image cards for Snob Test, Browse, and Stats pages
- [ ] Add `og:image` meta tag referencing the correct image to every page's `generateMetadata`
- [ ] Test all og:images with Twitter Card Validator and Facebook Sharing Debugger before launch

### robots.txt

- [ ] Create `public/robots.txt` with these exact rules:
  ```
  User-agent: *
  Allow: /
  Disallow: /api/
  Disallow: /admin/
  Disallow: /auth/
  Disallow: /profile/
  Disallow: /u/
  Sitemap: https://yourdomain.com/sitemap.xml
  ```

### Sitemap Index

- [ ] Use sitemap **index** format (not a single flat file) — split into three child sitemaps: `sitemap-pages.xml` (home, browse, stats, awards/\*), `sitemap-films.xml` (all /film/[slug] pages), `sitemap-persons.xml` (all /person/[slug] pages)
- [ ] Set `<priority>` values: homepage 1.0, browse 0.9, award hubs 0.8, film detail 0.7, person detail 0.6, blog 0.5
- [ ] Include `<lastmod>` on every URL so Google knows when content changed

### Footer Internal Links

- [ ] Add a footer section to every page with links to: Browse Oscar Winners · Browse Golden Globe Winners · Browse Cannes Winners · Best Picture Winners (blog) · Palme d'Or Winners (blog) · The Snob Test · Stats
- [ ] Use keyword-rich anchor text on all footer links (not "click here" — use "Browse Oscar Winners")

### AI Search Optimization (ChatGPT / Perplexity / Google AI Overviews)

- [ ] Structure every FAQ answer to open with a **one-sentence direct answer** before expanding — AI models extract the first sentence as the citation snippet
- [ ] Add an opening "lede" sentence to every film detail page: _"[Title] ([Year]) is a [genre] film directed by [Director] that received [X] Academy Award nominations and won [Y], including [top category]."_
- [ ] Add an opening "lede" sentence to every person detail page: _"[Name] has [X] Academy Award nominations, [Y] wins, and [Z] Golden Globe nominations."_
- [ ] Make the Stats page (`/stats`) heavily table and list-based — ranked data (most nominated, most winning) is heavily cited by Perplexity and Google AI Overviews
- [ ] Add a definitional opening paragraph to each award hub page: _"The Academy Award for Best Picture is..."_ — definitions get pulled directly into Google AI Overviews
- [ ] Ensure `FAQPage`, `Movie`, and `Person` schemas are complete and error-free — these directly feed Google AI Overview extraction

---

## 26b. Award Hub Pages

Three new pages that build topical authority and rank for award-body-level searches. These are pillar pages — each one links to hundreds of filtered browse views and blog posts.

### /awards/oscars

- [ ] Create `src/app/[locale]/awards/oscars/page.tsx` — server-rendered, fully static
- [ ] H1: "Academy Award Films"
- [ ] Opening paragraph (definitional, targets AI Overviews): "The Academy Award for Best Picture is the highest honour in the film industry, awarded annually by the Academy of Motion Picture Arts and Sciences since 1929..."
- [ ] H2: "Browse Oscar Winners and Nominees" — embed a filtered browse grid (`?awardBody=oscar`)
- [ ] H2: "Filter by Oscar Category" — pill links to each major category: Best Picture · Best Director · Best Actress · Best Actor · Best Supporting Actress · Best Supporting Actor · Best Animated Feature · Best International Film · Best Documentary — each links to `/browse?awardBody=oscar&category=[category]`
- [ ] H2: "Browse by Ceremony Year" — decade links to `/browse?awardBody=oscar&awardYear=[decade]`
- [ ] H2: "Frequently Asked Questions About the Academy Awards" — with FAQPage schema
- [ ] Meta title: `Academy Award Winning Films — Complete Oscar Database | CineRoll`
- [ ] Meta description: `Browse every Academy Award nominated and winning film in CineRoll's dataset. Filter by category, year, actor, or director. Roll a random Oscar film instantly.`
- [ ] Add BreadcrumbList schema: Home → Awards → Oscars
- [ ] Internal links: Stats page, Best Picture blog pillar, /browse with Oscar filter

### /awards/golden-globes

- [ ] Create `src/app/[locale]/awards/golden-globes/page.tsx` — same structure as Oscars page
- [ ] Meta title: `Golden Globe Winning Films — Complete Database | CineRoll`
- [ ] Meta description: `Browse every Golden Globe nominated and winning film in CineRoll's dataset. Filter by category, year, actor, or director. Roll a random Golden Globe film.`
- [ ] Categories section: Best Drama Film · Best Musical or Comedy · Best Director · Best Actress Drama · Best Actor Drama · Best Animated Film · Best Non-English Language Film
- [ ] Opening paragraph: "The Golden Globe Award for Best Motion Picture — Drama has been awarded annually since 1944..."

### /awards/cannes

- [ ] Create `src/app/[locale]/awards/cannes/page.tsx` — same structure
- [ ] Meta title: `Cannes Film Festival Winners — Complete Palme d'Or Database | CineRoll`
- [ ] Meta description: `Browse every Cannes Film Festival nominated and winning film in CineRoll's dataset. Filter by category, year, or director. Discover a Palme d'Or winner tonight.`
- [ ] Opening paragraph: "The Palme d'Or is the highest prize awarded at the Cannes Film Festival, one of the world's most prestigious film events, held annually in Cannes, France since 1955..."
- [ ] Add award hub pages to main navigation and footer

---

## 26c. Blog & Pillar Content Strategy

These pages target high-volume list-intent searches and build topical authority. Published as Next.js static pages (not a CMS) — content is written once and stays evergreen.

### Blog Infrastructure

- [ ] Create `src/app/[locale]/blog/page.tsx` — blog index listing all articles with title, description, and date
- [ ] Create `src/app/[locale]/blog/[slug]/page.tsx` — individual article pages with `generateStaticParams` so all posts are statically generated
- [ ] Add blog to main navigation and sitemap
- [ ] Each blog post: unique meta title + description, BreadcrumbList schema, internal links to filtered browse views and film detail pages

### Pillar Pages (Month 2 — publish these first)

- [ ] **"Complete Oscar Best Picture Winners List (1927–2026)"** at `/blog/oscar-best-picture-winners`
  - Table: Year · Film · Director · Wins · Nominations — every ceremony
  - Each film title links to its CineRoll detail page
  - "Roll a random Best Picture winner" CTA button linking to `/browse?awardBody=oscar&category=best-picture&winnerOnly=true`
  - Target keywords: "oscar best picture winners list", "academy award best picture all time"

- [ ] **"Complete Golden Globe Best Drama Film Winners"** at `/blog/golden-globe-best-drama-winners`
  - Same structure as Best Picture pillar
  - Target keywords: "golden globe best drama film winners", "golden globe drama winners list"

- [ ] **"Complete Cannes Palme d'Or Winners"** at `/blog/cannes-palme-dor-winners`
  - Target keywords: "palme d'or winners list", "cannes film festival winners all time"

### Supporting Articles (Months 3–6)

- [ ] "Oscar Best Picture Winners by Decade" — one section per decade, links to pillar
- [ ] "The Most Nominated Films That Never Won an Oscar"
- [ ] "Oscar vs Golden Globe Best Picture — Where They Agree and Disagree"
- [ ] "The 20 Best Picture Winners You Haven't Seen Yet" (links to Snob Test)
- [ ] "How to Find Your Next Film Using Award Data" (targets "what to watch" intent)
- [ ] "The Best Hidden Gem Oscar Films by Decade"
- [ ] "Best Films That Won Both Oscars AND Golden Globes"
- [ ] "The Data Behind the Oscars — What CineRoll's Dataset Reveals" ← data journalism, highly linkable
- [ ] "Every Director Who Has Won Both the Oscar and Palme d'Or"
- [ ] "Which Decade Had the Best Oscar Winners? A Data Analysis"
- [ ] "[Current Year] Oscar Nominees — Every Film in the Dataset" ← publish 6 weeks before ceremony each year

### Seasonal Content (publish 6 weeks before Oscar ceremony each year)

- [ ] "Oscar Night Watch Guide [Year] — Which Nominated Films to See First"
- [ ] "How Many [Year] Oscar Best Picture Nominees Have You Seen?" (links to Snob Test)
- [ ] "[Current Year] Oscar Nominees — Every Film in CineRoll's Dataset"

---

## 32. CI/CD Pipeline (GitHub Actions)

Automated checks that run on every push and pull request. Catches broken types, lint errors, and failed builds before they reach production — without you having to remember to run them manually.

### Workflow File

- [ ] Create `.github/workflows/ci.yml` that triggers on: every push to `main`, every pull request targeting `main`
- [ ] Job: **Type Check** — runs `npm run type-check` across all workspaces; fails the pipeline if any TypeScript errors exist
- [ ] Job: **Lint** — runs `npm run lint` across all workspaces; fails the pipeline if ESLint reports errors
- [ ] Job: **Build** — runs `npm run build` for both frontend and backend; catches any compilation errors that only surface at build time (not dev)
- [ ] Jobs run in parallel where possible to keep total CI time under 3 minutes
- [ ] Cache `node_modules` between runs using `actions/cache` keyed on `package-lock.json` hash — avoids reinstalling all dependencies on every run

### Branch Protection

- [ ] In GitHub → Settings → Branches → Add rule for `main`:
  - [ ] Require status checks to pass before merging (select: type-check, lint, build)
  - [ ] Require branches to be up to date before merging
  - [ ] Do not allow force pushes to `main`
- [ ] This prevents any code from reaching `main` (and therefore production) unless CI passes

### Dependency Security

- [ ] Add a `npm audit` step to the CI workflow — runs `npm audit --audit-level=high`; fails the pipeline on any high or critical severity vulnerability
- [ ] Run `npm audit` locally before every deploy and resolve any flagged packages
- [ ] Set up **Dependabot** in GitHub (`.github/dependabot.yml`) to automatically open PRs when dependencies have new versions — review and merge weekly

### Cost & Billing Alerts

- [ ] Set a **Vercel spending limit** in the Vercel dashboard — alert by email if monthly usage exceeds your free tier
- [ ] Set a **Railway budget alert** — Railway dashboard → Project → Settings → Spending Limit; set to $5–10 above your expected monthly cost
- [ ] Set a **Neon compute alert** in the Neon console — alert if active compute hours approach the free tier limit
- [ ] Review all three dashboards once a month to catch unexpected spikes

---

## 33. Automated Testing

A minimal but meaningful test suite covering the critical paths. Not full coverage — just enough to catch regressions in the features your users depend on most.

### Setup

- [ ] Install **Playwright** for E2E tests in the frontend workspace: `npm install -D @playwright/test --workspace=frontend`
- [ ] Run `npx playwright install` to download browser binaries (Chromium, Firefox, WebKit)
- [ ] Create `frontend/playwright.config.ts` — configure base URL (`http://localhost:3000`), 3 browser projects (chromium, firefox, webkit), screenshot on failure, 30s timeout
- [ ] Add `test:e2e` script to `frontend/package.json`: `playwright test`
- [ ] Install **Vitest** for backend unit tests: `npm install -D vitest --workspace=backend`
- [ ] Add `test` script to `backend/package.json`: `vitest run`
- [ ] Add both test commands to the CI workflow (run after build job succeeds)

### E2E Tests — Golden Path (must always pass)

These cover the core user journey. If any of these break, the site is broken for real users.

- [ ] **Roll test** — visit homepage, click the Roll button, verify a film card appears with a title, year, and poster; verify the "Roll Again" button is visible
- [ ] **Spacebar roll** — visit homepage, press spacebar, verify a film card appears (tests keyboard shortcut)
- [ ] **Browse test** — visit `/browse`, verify the film grid loads with at least one film card; verify the result count text is visible
- [ ] **Filter test** — visit `/browse`, select "Oscar" award body filter, verify the result count changes and at least one card remains
- [ ] **Film detail test** — click a film card from browse, verify the detail page loads with an H1 matching the film title, an awards section, and a plot section
- [ ] **404 test** — visit `/film/this-film-does-not-exist`, verify the 404 page renders (not a crash)
- [ ] **Snob Test** — visit `/snob-test`, verify 20 film posters render; click 3 of them, click "See My Score", verify a score title appears
- [ ] **Dark/light mode** — toggle the theme pill, verify the `data-theme` attribute on `<html>` changes

### E2E Tests — Auth Flow

- [ ] **Sign-in page loads** — visit `/auth/signin`, verify the email input and "Continue with Google" button are visible
- [ ] **Protected route redirect** — visit `/profile` while not logged in, verify redirect to `/auth/signin`

### Backend Unit Tests

- [ ] **Filter query builder** — unit test the `buildWhereClause` function (or equivalent) with: no filters (returns all), Oscar only, winner only, person name, combined filters — verify the correct Prisma `where` object is produced without hitting the database
- [ ] **Slug generation** — unit test the slug generation utility: verify "The Godfather" + 1972 → `the-godfather-1972`; verify duplicate slugs get a suffix
- [ ] **Score calculation** (Snob Test) — unit test the score endpoint logic: 0 seen → "Certified Normie", 20/20 seen → "The Snob"
- [ ] **API error responses** — unit test the error handler middleware: verify it returns `{ error: string, code: string }` shape with the correct HTTP status code for each error type

### Running Tests Locally

- [ ] `npm run test --workspace=backend` — runs Vitest unit tests
- [ ] `npm run dev` in one terminal, then `npm run test:e2e --workspace=frontend` in another — runs Playwright against the live dev server
- [ ] All tests must pass before submitting a pull request (enforced by CI branch protection)

---

## 27. Legal Pages

Required before launching with real users. Google OAuth will not approve your app for public use without a Privacy Policy URL, and Resend requires one for transactional email.

### Privacy Policy

- [ ] Write a Privacy Policy page at `/privacy` covering: what personal data you collect (email, name, avatar from Google OAuth; watch history; ratings; comments), why you collect it, how long you keep it, who you share it with (Neon, Railway, Vercel, Resend, TMDB/OMDB as data processors), and how users can request deletion
- [ ] Add the Privacy Policy URL to your Google Cloud Console OAuth consent screen — without this, Google blocks public sign-in
- [ ] Add Privacy Policy link to the site footer (visible on every page)

### Terms of Service

- [ ] Write a Terms of Service page at `/terms` covering: acceptable use, content ownership (users own their comments/ratings), your right to remove abusive content, disclaimer that CineRoll is not affiliated with the Academy Awards, Golden Globes, TMDB, IMDb, or OMDb
- [ ] Add Terms of Service link to the site footer

### Cookie Policy

- [ ] Document what cookies CineRoll sets: Auth.js session cookie, `NEXT_LOCALE` preference cookie, `pwa-prompt-shown` and `cineroll_onboarded` localStorage flags
- [ ] Add Cookie Policy link to the site footer or include it within the Privacy Policy
- [ ] Add a simple cookie consent banner for EU/UK visitors — shown once on first visit, dismissed on accept; use localStorage to remember the choice; no tracking cookies are set before consent

---

## 28. GDPR & Account Deletion

If any user is in the EU, UK, or California (CCPA), you are legally required to honor these rights.

### Account Deletion (Right to Erasure)

- [ ] Backend: add DELETE /api/user/account (auth required) — hard-delete the User row and cascade-delete all related data: Watchlist entries, WatchedFilm entries, UserRating entries, FilmComment entries, PushSubscription entries, UserList entries, ChallengeCompletion entries; return 204 on success
- [ ] Frontend: add "Delete My Account" button in profile settings — show a confirmation dialog ("This will permanently delete your account and all your data. This cannot be undone.") before calling the endpoint
- [ ] After successful deletion, sign the user out and redirect to the home page with a "Your account has been deleted" toast
- [ ] Test: create a test account, save films, rate films, comment, then delete — verify all rows are removed from every table

### Data Export (Right to Portability)

- [ ] Backend: add GET /api/user/export (auth required) — return a JSON file containing all the user's data: profile info, watchlist, watched films, ratings, comments, custom lists; set `Content-Disposition: attachment; filename="cineroll-data.json"` header
- [ ] Frontend: add "Download My Data" button in profile settings — clicking it triggers the file download

### Cookie Consent

- [ ] Cookie consent banner (required by GDPR): shown on first visit to EU/UK users; "Accept" stores consent in localStorage; no analytics or non-essential cookies fire before consent is given
- [ ] Add a "Cookie Preferences" link in the footer so users can revisit their choice

---

## 29. Content Moderation

You have user-generated content (comments, feedback form). Without moderation, one bad actor can damage the site's reputation overnight.

### Comment Reporting

- [ ] Add a "Report" button (flag icon) on every comment visible to all logged-in users
- [ ] Backend: add POST /api/films/:slug/comments/:id/report (auth required) — record the report; body: `{ reason: string }` (dropdown: spam, harassment, spoiler, off-topic); store in a `CommentReport` model (id, commentId, reportedByUserId, reason, createdAt); do not allow a user to report the same comment twice
- [ ] Backend: when a comment receives 3+ reports, automatically hide it (set `hidden = true` on `FilmComment`); hidden comments are excluded from GET /api/films/:slug/comments responses
- [ ] Admin panel: add a "Reported Comments" tab showing all comments with at least one report; admin can delete or clear (dismiss) each report

### Admin Comment Deletion

- [ ] Backend: add DELETE /api/admin/comments/:id — allows admin to delete any comment regardless of author; requires `ADMIN_SECRET` header
- [ ] Admin panel: add a delete button on each comment in the reported comments view

### Feedback Spam Protection

- [ ] The feedback form (section 17d) already has IP-based rate limiting — verify it is active in production
- [ ] Add honeypot field to the feedback form: a hidden input that bots fill in but humans don't; reject any submission where the honeypot field is non-empty
- [ ] Admin panel feedback inbox: mark submissions as read/unread so you can track which ones you've reviewed

---

## 30. Uptime Monitoring

You need to know when Railway or Neon goes down before your users do.

- [ ] Sign up for **BetterStack** (free tier) or **UptimeRobot** (free tier) — both are free for basic uptime monitoring
- [ ] Add a monitor for the backend health check: `GET https://your-railway-domain/health` — check every 1 minute; alert by email if it fails 2 consecutive checks
- [ ] Add a monitor for the frontend: `GET https://your-domain.com` — check every 5 minutes; alert if it returns a non-200 status
- [ ] Add a monitor for the database: the `/health` endpoint should verify the Prisma connection (add a `prisma.$queryRaw\`SELECT 1\`` check inside the health route); if the DB is down, the health check returns 503 and the monitor alerts you
- [ ] Configure alert recipients: your email + any co-owners
- [ ] Set up a public status page (BetterStack provides one for free) so users can check `status.yourdomain.com` themselves during an outage
- [ ] Test the monitors: temporarily break the health endpoint, verify an alert arrives within 2 minutes, then restore it

---

## 31. Error Tracking (Sentry)

Sentry is mentioned in the deployment section but needs to be set up as a real, dedicated step. Without it, you will not know about 500 errors or client-side crashes your users are silently hitting.

### Backend

- [ ] Install Sentry SDK in backend: `npm install @sentry/node --workspace=backend`
- [ ] Add `SENTRY_DSN` to `backend/.env` (get DSN from sentry.io after creating a project)
- [ ] Initialize Sentry at the top of `backend/src/index.ts` before any other imports: `Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV })`
- [ ] Add Sentry error handler middleware in `backend/src/app.ts` after all routes: `app.use(Sentry.Handlers.errorHandler())` — this captures all unhandled Express errors automatically
- [ ] Verify: trigger a deliberate 500 error in a route, confirm it appears in the Sentry dashboard within 30 seconds

### Frontend

- [ ] Install Sentry Next.js SDK in frontend: `npm install @sentry/nextjs --workspace=frontend`
- [ ] Run the Sentry Next.js wizard: `npx @sentry/wizard@latest -i nextjs` — it creates `sentry.client.config.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts` automatically
- [ ] Add `NEXT_PUBLIC_SENTRY_DSN` to `frontend/.env.local`
- [ ] Verify client-side error capture: throw a deliberate error in a component, confirm it appears in Sentry
- [ ] Set up Sentry **Alerts**: create an alert rule that sends an email when a new issue is first seen, and another when an issue occurs more than 10 times in 1 hour

### Sentry Configuration

- [ ] Set `tracesSampleRate: 0.1` (10% of transactions) in production to stay within the free tier limits
- [ ] Add `ignoreErrors` for known benign errors: network timeouts, user-cancelled requests, browser extension errors
- [ ] Configure source maps: Sentry wizard handles this automatically for Next.js; verify stack traces show original TypeScript line numbers (not compiled JS)
- [ ] Set `environment` tag: `"production"` vs `"development"` so alerts only fire for production errors

---

## 🏹 Product Hunt Launch

### What Product Hunt Judges in the First 30 Seconds

- [ ] **Does it work?** — Everything is deployed, fast, and bug-free; visitors click the link and try it immediately
- [ ] **Do I get it instantly?** — The hero section communicates the core value in one sentence
- [ ] **Is there a "wow moment"?** — At least one feature users will screenshot and share

---

### 1. Ship the Viral-Ready Features First

These unbuilt features are perfect for Product Hunt — any one of them could be the headline on launch day:

- [ ] **The Snob Test** (item 8b) — a quiz people share their results from; Product Hunt loves this
- [ ] **Roll Battle** (item 9b) — swipe to decide between two films; inherently shareable
- [ ] **Natural Language Roll** (item 9d) — "roll me a sad French film from the 80s" — this is your live demo moment

---

### 2. Nail the First 5 Seconds of UX

- [ ] Add a one-liner tagline under the site title — e.g. _"Discover Oscar & Golden Globe films — filtered exactly how your brain works."_
- [ ] The Roll button must be impossible to miss and work instantly on first visit (no login required)

---

### 3. Prepare the Product Hunt Listing Assets

- [ ] Take 3–5 screenshots in sequence that tell a story: filter → roll → detail page → award history
- [ ] Record a demo GIF or short Loom video showing a full roll interaction in under 30 seconds
- [ ] Write a tagline (60 chars max) — e.g. _"Roll a random Oscar film, filtered any way you want"_
- [ ] Choose topics to tag: **Movies**, **Discovery**, **Entertainment**, **Design Tools**

---

### 4. Technical Must-Haves Before Launch

- [ ] Deployed to Vercel + Railway with a real custom domain
- [ ] `og:image` meta tags on every page so sharing looks good on Twitter/Slack/iMessage
- [ ] Film detail pages using ISR (Incremental Static Regeneration) — must load fast from cold
- [ ] Mobile layout fully polished — Product Hunt traffic is 40%+ mobile

---

### 5. Launch Day Strategy

- [ ] Launch on **Tuesday or Wednesday** — the highest-traffic days on Product Hunt
- [ ] Post at **12:01 AM Pacific time** to get a full 24-hour window
- [ ] Have 10–15 people ready to upvote and comment in the **first 2 hours** — early velocity is everything
- [ ] Write a **maker comment** explaining why you built it and what makes it different from IMDb / Letterboxd

---

## 🚀 Scalability & Future Improvements

- Current design supports 2000-2500 films efficiently
- To scale beyond: add caching layer (Redis), implement full-text search optimization, load balancing
- Future features: ratings and reviews, social watchlists (share with friends), collaborative filtering for recommendations
- Known limitations: content-based recommendations only (no collaborative filtering in MVP)
- Potential improvements: add E2E tests, implement analytics dashboard, social features (follow other users, see their watchlists)
