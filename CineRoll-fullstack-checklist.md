# CineRoll — Fullstack MVP Checklist (Text-Only)

---

## Application Summary

**CineRoll** is a film discovery web app whose core value is **deep award-data filtering**. Users can slice the full catalogue by every dimension the dataset provides — nominee name, director, award body, category, win/nomination status, ceremony year, genre, and decade — and then either browse results or roll a random film from within that filtered set.

### What it does

- **Advanced Award Filtering** — The primary feature. Users compose filters from: award body (Oscar / Golden Globe), win vs. nomination status, specific category (Best Picture, Best Director, Best Actress, etc.), ceremony year, nominee or winner name, director name, genre, and release decade. Any combination of filters can be active at once.
- **Filtered Roll** — Once filters are set, the Roll button picks a random film from within the filtered results. "Roll me a Cate Blanchett Oscar-nominated film from the 2000s" is a valid interaction.
- **Pure Roll (no filters)** — With no filters active, Roll returns a completely random film from the full dataset. Simple discovery without setup.
- **Browse & Paginate** — Filtered results are shown as a paginated grid so users can explore instead of (or in addition to) rolling.
- **Film Detail Pages** — Each film has a dedicated page (`/film/:slug`) showing full metadata: backdrop, trailer, IMDB/RT ratings, and a complete Oscar and Golden Globe history broken down by category and year.
- **Pick of the Day** — A manually curated featured film shown on the home page each day.
- **Watchlist & Watch History** — Logged-in users can save films to a watchlist or mark them as watched (with an option to exclude from future rolls).
- **Personalized Recommendations** — On the user's profile page, film suggestions are generated from their watch history and watchlist — separate from the manually curated Pick of the Day.

### The Dataset

Hand-curated CSV files — Oscar records split by decade (`movie names - oscar 1929-1939.csv`, `movie names - oscar 1940s.csv`, etc.) and one file for Golden Globe records. Each row is a single nomination or win with: a unique award ID (`OSC-` / `GG-` prefix), the ceremony year, the film title, the film's release year, the award category, the nominee's name, and whether they won. The enrich script groups these records by film, calculates counts, and enriches each unique film via TMDB (poster, backdrop, runtime, genres, director, cast, trailer) and OMDB (IMDB rating, Rotten Tomatoes score). The final dataset is seeded into PostgreSQL. **Every AwardRecord stored for each film — nominee name, category, year, win flag — is a filterable dimension available to the user.**

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
5. Backend — Film Data Pipeline
6. Backend — API Routes
7. Frontend — Project Setup
8. Frontend — Base Components
9. Frontend — Roll Feature
10. Frontend — Pick of the Day
11. Frontend — Film Detail Pages
12. Frontend — Browse, Filter & Filtered Roll
13. Internationalization (i18n)
13.5. Rating Filters (IMDb & Rotten Tomatoes)
14. Frontend — Pages & Routing
15. Auth & User System
16. Watchlist & Watch History
17. Profile & Personalized Recommendations
18. Deployment
19. Documentation
20. Performance & Lighthouse Audit
21. Google Search Ranking (SEO)

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
  - AwardRecord interface: `{ awardYear: number; category: string; nominee: string; won: boolean }` — one record per nomination/win, stored in oscarCategories / ggCategories JSON arrays
  - Film interface (id, slug, tmdbId, imdbId, title, releaseYear, runtime, genres array, plot, director, cast array, language, poster URL, backdrop URL, trailer URL, IMDB rating, Rotten Tomatoes score, Oscar nominations/wins/categories, Golden Globe nominations/wins/categories, pick of day flag and date)
  - RollEvent interface (id, filmId, timestamp)
  - FilterState interface: `search` (film title), `person` (nominee/winner name — searches all AwardRecord entries), `director` (director name), `awardBody` ("oscar" | "goldenglobe" | "both"), `winnerOnly` (boolean), `nominatedOnly` (boolean), `category` (award category string), `awardYear` (ceremony year number), `genre` (string), `decadeMin`/`decadeMax` (release decade), `page` (number)
  - PaginatedFilms interface (films array, total count, current page, total pages)
  - ApiError interface (error message, error code)
  - User interface (id, email, name, image)
  - WatchlistEntry interface (id, userId, filmId, addedAt)
  - WatchedEntry interface (id, userId, filmId, watchedAt, doNotSuggest)
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
- [x] Define Film model with all fields: id (primary key), slug (unique), TMDB ID, IMDB ID, title, releaseYear (the film's release year), runtime, genres (array), plot, director, cast (array), language, poster URL, backdrop URL, trailer URL, IMDB rating, Rotten Tomatoes score, Oscar fields (nominations count, wins count, categories JSON array of AwardRecord), Golden Globe fields (nominations count, wins count, categories JSON array of AwardRecord), pick of day flag and date, timestamps
- [x] Define RollEvent model with id, filmId (foreign key to Film), and timestamp
- [x] Define relationships: RollEvent belongs to Film, Film has many RollEvents
- [x] Set up Prisma to use PostgreSQL database
- [ ] Run Prisma migration to create database schema: `prisma migrate dev --name init`
- [ ] Verify database tables are created in Neon PostgreSQL console
- [x] Regenerate Prisma client: `prisma generate`
- [x] Create `backend/src/lib/prisma.ts` as a singleton instance of Prisma client for reuse across routes

---

## 5. Backend — Film Data Pipeline

### 5.0 Data File Preparation

- [x] Create `backend/data/` directory
- [x] Add data files to root `.gitignore` so they don't get committed
- [x] Prepare Oscar CSV files in `backend/data/` — one file per decade, named `movie names - oscar DECADE.csv` (e.g. `movie names - oscar 1929-1939.csv`, `movie names - oscar 1940s.csv`). Each file has one row per nomination/win with columns: `Id, Award Year, Movie Name, Release Year, Type Of Award, Award Winner, Award Nominee`
  - `Id` format: `OSC-{year}-{nn}` (e.g. `OSC-1929-01`)
  - `Award Winner` = person/studio name if they won, `NaN` if nominated only
  - The enrich script auto-discovers all files matching `movie names - oscar *.csv` — add new decade files and re-run
- [x] Prepare `backend/data/films-goldenglobe.csv` — same column structure, `Id` format: `GG-{year}-{nn}`

### 5a. Enrichment Script — Fetch Data from TMDB & OMDB APIs

- [x] Install CSV parsing library (csv-parse) in backend
- [x] Create `backend/.env.local` with TMDB_API_KEY and OMDB_API_KEY (these are only for enrichment, not used at runtime)
- [x] Update `backend/src/scripts/enrich.ts` script to:
  - Load environment variables from .env.local
  - Auto-discover and read all `movie names - oscar *.csv` decade files, then read `films-goldenglobe.csv`
  - Group rows by (film title + release year) to get unique films
  - For each unique film, build `oscarCategories` and `ggCategories` arrays of `AwardRecord` objects: `{ awardYear, category, nominee, won }`
  - Calculate `oscarNominations`, `oscarWins`, `ggNominations`, `ggWins` counts from grouped rows
  - Search TMDB API using film title and release year to get TMDB ID
  - If no match found, log error to enrichment-errors.csv and continue to next film
  - If match found, fetch full TMDB movie details to get: runtime, genres, director, cast (top 10), IMDB ID, poster, backdrop, and trailer URL
  - Use IMDB ID to query OMDB API for: IMDB rating and Rotten Tomatoes score
  - Generate a unique slug for the film (lowercase title with hyphens, append year if duplicate)
  - Add rate limiting between API calls (250ms delay) to respect rate limits
  - Write all successfully enriched films to films-enriched.json
  - Write failed films to enrichment-errors.csv with reason
  - Log summary: how many enriched, how many errors
- [x] Run enrichment script
- [x] Review enrichment-errors.csv to see which films failed to match
- [x] Fix any failed films by correcting title spelling in source CSVs, then re-run
- [x] Validate output: verify all slugs are unique, spot-check entries for data quality
- [x] Save validated result as `backend/data/films-final.json` (do not overwrite after seeding)

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

---

## 6. Backend — API Routes & Performance

- [x] Create `backend/src/routes/index.ts` that exports a router with all sub-routes mounted
- [x] Create `backend/src/routes/films.ts` with:
  - [x] GET /api/films (search with filters — all combinable):
    - `search` — film title text search
    - `person` — nominee or winner name (searches all AwardRecord entries across oscarCategories + ggCategories)
    - `director` — director name (matches Film.director field)
    - `awardBody` — "oscar" | "goldenglobe" | "both"
    - `winnerOnly` — boolean, show only films with at least one win
    - `nominatedOnly` — boolean, show films with nominations (won or not)
    - `category` — award category string (e.g. "Best Actress in a Leading Role")
    - `awardYear` — ceremony year (matches AwardRecord.awardYear)
    - `genre` — film genre
    - `decadeMin`/`decadeMax` — release decade range
    - `page`, `limit`

  - [x] GET /api/films/categories — return distinct list of all award categories in the dataset (used to populate category dropdown in UI)
  - [x] GET /api/films/award-years — return sorted list of all distinct ceremony years in the dataset (used to populate award year dropdown)
  - [x] GET /api/films/:slug (get single film by slug with full details including all AwardRecord arrays)

- [x] Create `backend/src/routes/random.ts` with:
  - [x] GET /api/random (return a random film from database — no filters)
  - [x] GET /api/random accepts all the same filter params as /api/films — when filters are present, pick one random film from the matching set; when no filters, pick from full dataset
  - [x] Accept optional `userId` param — when provided, exclude films the user has marked `doNotSuggest=true`
- [x] Create `backend/src/routes/roll.ts` with:
  - [x] POST /api/roll (log a roll event when user clicks Roll button)
- [x] Create `backend/src/routes/pickOfDay.ts` with:
  - [x] GET /api/pick-of-day (get today's featured film, return 404 if none set)
- [x] For each route, implement:
  - [x] Request validation using Zod schemas (validate query params, request body)
  - [x] Authorization checks if needed
  - [x] Prisma queries to fetch data from database
  - [x] Error handling with appropriate HTTP status codes
  - [x] Consistent response format
- [x] Create `backend/src/middleware/errorHandler.ts` to catch all errors and return consistent error responses
- [x] Create `backend/src/middleware/validate.ts` to validate requests against Zod schemas
- [x] Mount all routes in `backend/src/app.ts`
- [x] Test all endpoints using Postman or similar tool

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
- [x] Test API response times: search should complete in under 200ms, single lookups under 100ms
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
- [x] Setup global styles using Tailwind CSS
- [x] Define CSS variables for color scheme, spacing, typography
- [x] Create root layout in `src/app/layout.tsx` with head, body, and theme provider setup
- [x] Add ESLint configuration to frontend

---

## 8. Frontend — Base Components

- [x] Create reusable UI components in `src/components/ui/`:
  - Button component (primary, secondary variants, sizes)
  - Card component (for film cards)
  - Skeleton component (loading placeholders)
  - Modal/Dialog component (for film details overlay)
  - Input/TextField component (for search)
  - Select component (for genre/decade filters)
  - Toast/Alert component (for error messages)
- [x] Create a Filter Bar component — redesigned with award-first layout: person search, award body pills, won/nominated status pills, category dropdown, award year, genre, decade slider
- [x] Create a Film Card component that displays poster, title, year, rating
- [x] Apply consistent styling using design tokens (colors, spacing, fonts)
- [x] Ensure all components have proper TypeScript types
- [x] Ensure accessibility: ARIA labels, semantic HTML, keyboard navigation

---

## 9. Frontend — Roll Feature

- [x] Create `src/app/page.tsx` (home page)
- [x] Add large "Roll" button that triggers API call to /api/random
- [x] Display loading state while fetching
- [x] Display film card with poster, title, year, rating
- [x] Add "Roll Again" button to fetch another random film
- [x] Implement smooth animations for result reveal using Framer Motion
- [x] Display "Pick of the Day" section that calls /api/pick-of-day endpoint
- [x] Show fallback message if no pick of day is set
- [x] Add error handling with toast notification if API fails
- [x] Make responsive: adjust button sizes and spacing for mobile

### Filtered Roll (Roll Within a Filtered Set)

- [x] When the user has active filters, the Roll button should pick randomly from matching films only, not the full dataset
- [x] Backend: add GET /api/random endpoint support for all filter params (same params as /api/films) — pick one random film from the filtered result set
- [x] Frontend: pass active filter state from the Filter Bar into the Roll API call
- [x] Display a subtle indicator when Roll is operating on a filtered set (e.g. "Rolling from 47 matching films")
- [x] If filters return zero films, disable Roll button and show "No films match — adjust your filters"
- [x] With no filters active, Roll behaves exactly as before (pure random from full dataset)

### Home Page Filter Panel (Award-First Design)

Filter section sits **above** the Roll button. All filters are optional — user sets what they want, then hits Roll. The "Rolling from N films" counter updates live as filters change.

- [x] Filter panel placed above Roll button (JSX done, full wiring in progress)
- [x] **Person / cast / director search** — single text input; searches across cast, directors, and award nominee names — e.g. "Meryl Streep" rolls only films she appeared in or was nominated for; wire to `person` param on /api/random
- [x] **Award body pills** — Oscar / Golden Globe / Both; wire to `awardBody` param
- [x] **Status pills** — All / Won / Nominated; wire to `winnerOnly` and `nominatedOnly` params
- [x] **Category dropdown** — populate dynamically from GET /api/films/categories (currently hardcoded placeholder list); wire to `category` param
- [x] **Award Year** — number input for ceremony year (e.g. 1994); wire to `awardYear` param; optionally populate options from GET /api/films/award-years
- [x] **Genre dropdown** — already wired; confirm it works with award filters combined
- [x] **Decade range slider** — already wired; confirm it works with award filters combined
- [x] **Active filter chips** — show one dismissible chip per active filter so the user can see and remove individual selections
- [x] **Clear all filters** button — resets everything to default in one click
- [x] Verify all filters combine correctly end-to-end: e.g. "Meryl Streep + Oscar + Won + Best Actress" returns the right films

---

## 10. Frontend — Pick of the Day

- [x] Create component to display pick of the day on home page
- [x] Call /api/pick-of-day endpoint on page load
- [x] Display film details: poster, title, year, plot, why it was picked
- [x] Show fallback message if no pick is set ("No pick today, roll to discover!")
- [x] Add navigation link to full film detail page
- [x] Handle loading and error states
- [x] Make responsive for all screen sizes

---

## 11. Frontend — Film Detail Pages

- [x] Create `src/app/film/[slug]/page.tsx` dynamic route
- [x] Fetch film data by slug from `/api/films/:slug` endpoint
- [x] Display complete film information:
  - Large poster and backdrop images
  - Title, year, runtime, genres
  - Director and main cast
  - Full plot synopsis
  - IMDB and Rotten Tomatoes ratings with icons
  - Language information
- [x] Display awards information:
  - Oscar nominations and wins (organized by category and year)
  - Golden Globe nominations and wins (organized by category and year)
  - Total award counts
- [x] Embed or link YouTube trailer if available
- [x] Add SEO metadata: dynamic title, description, Open Graph images, Twitter cards
- [x] Create 404 page if film slug not found
- [x] Make responsive: stack all content vertically on mobile, use grid layout on desktop
- [x] Add "Back to Browse" or "Roll Again" navigation buttons

---

## 12. Frontend — Browse, Filter & Filtered Roll

This is the core feature of CineRoll. The filter system is what separates the app from a simple random-picker and makes it portfolio-level. Every dimension in the award dataset should be an operable filter.

### Filter Bar

The same award-first filter panel used on the home page is also the core of the browse page. Filters are shared via the `FilterBar` component and `useFilters` hook.

- [x] Create `src/app/browse/page.tsx` (browse page) — full filter UI + paginated results grid
- [x] **Person / cast / director search** — free-text input searching nominee/winner names and director; same as home page filter (shared component)
- [x] **Film title search** — separate text input for film title (browse page only, in addition to person search)
- [x] **Award body selector** — Oscar / Golden Globe / Both pills (shared component)
- [x] **Win status toggle** — All / Won / Nominated pills (shared component)
- [x] **Category dropdown** — populated from GET /api/films/categories (shared component)
- [x] **Ceremony year** — filter by award ceremony year (shared component)
- [x] **Genre dropdown** — (shared component)
- [x] **Decade range slider** — (shared component)
- [x] **Active filter chips** — dismissible chip per active filter (shared component)
- [x] **Clear all filters** button (shared component)
- [x] Sync all filter state to URL query params so filtered browse views are shareable/bookmarkable

### Search & Filter Behavior

- [x] All filters are combinable: "Cate Blanchett" + "Oscar" + "Won" + "2000s" is a valid compound query
- [x] Sync all filter state to URL query parameters so filtered views are shareable and bookmarkable
- [x] Make text inputs debounced (300ms) — don't fire API on every keystroke
- [x] Show result count: "47 films match your filters" (update as filters change)
- [x] When result count is zero, show "No films match — try adjusting your filters" with a suggested reset

### Results Grid

- [x] Display results in responsive grid: 2 columns mobile, 3 tablet, 4–6 desktop
- [x] Each film card shows: poster, title, release year, award summary (e.g. "3 Oscar wins · 1 Golden Globe nomination")
- [x] Add loading skeletons while fetching
- [x] Implement pagination: 12 films per page; Previous / Next buttons with page number
- [x] Make each film card clickable → navigate to /film/:slug detail page

### Filtered Roll from Browse

- [x] "Roll from these results" button visible when filters are active — picks one random film from the filtered set and navigates to its detail page or shows it inline
- [x] Button is disabled and shows "No matches" when filter set is empty
- [x] Button label shows count: "Roll from 47 films"

### API Integration

- [x] Create `src/lib/api.ts` API client with typed functions for `/api/films` and `/api/random` accepting full FilterState
- [x] Create `src/hooks/useFilters.ts` to manage filter state
- [x] Add URL sync to `useFilters` — read/write all filter params to URL query string so browse views are shareable
- [x] FilterState covers: `search`, `person`, `director`, `awardBody`, `winnerOnly`, `nominatedOnly`, `category`, `awardYear`, `genre`, `decadeMin`, `decadeMax`, `page`
- [x] Fetch category list from GET /api/films/categories and pass into FilterBar (currently hardcoded)
- [x] Fetch award years from GET /api/films/award-years and use for award year picker

---

## 13. Internationalization (i18n)

The app auto-detects the user's language from their browser locale and renders the UI in that language. Users can switch to any supported language at any time, and their preference is remembered across sessions.

### Supported Languages (starter set)

English (`en`), Spanish (`es`), French (`fr`), German (`de`), Persian/Farsi (`fa`), Japanese (`ja`), Portuguese (`pt`).

### Setup & Configuration

- [x] Install `next-intl` in frontend: `npm install next-intl --workspace=frontend`
- [x] Create `frontend/messages/` directory with one JSON file per language: `en.json`, `es.json`, `fr.json`, `de.json`, `fa.json`, `ja.json`, `pt.json`
- [x] Create `frontend/src/i18n/request.ts` to configure locale detection (reads `Accept-Language` header via `next-intl` middleware)
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

- [x] Add `imdbRatingMin`, `imdbRatingMax`, `rtScoreMin`, `rtScoreMax` (all `number`) to `FilterState` in `packages/types/src/index.ts`
- [x] Rebuild the types package: `npm run build --workspace=packages/types`

### Backend

- [x] Add `imdbRatingMin`, `imdbRatingMax` (coerced float, 0–10), `rtScoreMin`, `rtScoreMax` (coerced int, 0–100) to `listQueryBaseSchema` in `backend/src/lib/filmFilters.ts`
- [x] Add WHERE clause conditions in `buildWhereClause`: when either bound is provided, add `"Film"."imdbRating" IS NOT NULL` (or `rtScore`) plus the range comparisons so null-rated films are excluded when a rating filter is active

### Frontend

- [x] Update `filtersToParams` in `frontend/src/lib/api.ts` to serialize the four rating params to URL only when non-default (imdbRatingMin > 0, imdbRatingMax < 10, rtScoreMin > 0, rtScoreMax < 100)
- [x] Add `DEFAULT_IMDB_MIN` (0), `DEFAULT_IMDB_MAX` (10), `DEFAULT_RT_MIN` (0), `DEFAULT_RT_MAX` (100) constants and the four fields to `DEFAULT_FILTERS` in `frontend/src/hooks/useFilters.ts`; include all four in `hasActiveFilters`
- [x] Add IMDb range slider (step 0.5, shows "Any" at defaults) and RT range slider (step 5, shows "Any" at defaults) to `FilterBar` in `frontend/src/components/filter-bar.tsx`, placed after the Genre + Decade section
- [x] Add active filter chips for IMDb (label: `IMDb 7–10`) and RT (label: `RT 70%–100%`) with individual remove handlers
- [x] Make `DecadeRangeSlider` accept an optional `step` prop (default 10) so it can be reused for both rating sliders
- [x] Parse `imdbRatingMin`, `imdbRatingMax`, `rtScoreMin`, `rtScoreMax` from URL search params in `filtersFromSearchParams` inside `frontend/src/components/browse-page-client.tsx`

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

### 14b. Frontend — Auth.js Setup

- [ ] Install `next-auth` (Auth.js v5) in frontend: `npm install next-auth --workspace=frontend`
- [ ] Install `@auth/prisma-adapter` in frontend (connects Auth.js sessions to the Prisma User model)
- [ ] Create `src/auth.ts` — configure Auth.js with:
  - Google OAuth provider (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`)
  - Prisma adapter pointing to the shared Neon database
  - JWT strategy (so tokens can be forwarded to the Express backend)
- [ ] Create `src/app/api/auth/[...nextauth]/route.ts` — Next.js route handler that delegates to Auth.js
- [ ] Add required environment variables to `frontend/.env.local`: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- [ ] Create OAuth credentials in Google Cloud Console (Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`)
- [ ] Create `src/app/auth/signin/page.tsx` — styled sign-in page with "Sign in with Google" button; show a brief explanation of why sign-in is needed ("Save films to your watchlist and get personalized recommendations")
- [ ] Create `src/components/AuthButton.tsx` — shows sign-in button when logged out; shows user avatar, name, and sign-out option when logged in
- [ ] Add `AuthButton` to the site header / navigation bar
- [ ] Create `src/lib/apiWithAuth.ts` — wrapper around the API client that forwards the Auth.js JWT in the `Authorization` header for protected backend calls
- [ ] Test: sign in with Google, verify session is created in the database, JWT is available client-side

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

- [ ] After a roll result is displayed, render two action buttons below the film card:
  - "Save to Watchlist" (bookmark icon, e.g. `lucide-react` Bookmark)
  - "I've Watched This" (checkmark icon, e.g. `lucide-react` CheckCircle)
- [ ] If the user is **not logged in**: clicking either button opens a sign-in prompt modal ("Sign in to save your watchlist and track what you've seen") with a link to `/auth/signin`
- [ ] If the user **is logged in**:
  - "Save to Watchlist" calls POST /api/user/watchlist; show a success toast on save; change icon to filled/active state
  - "I've Watched This" opens an inline confirmation with a "Don't suggest this to me again" toggle, then calls POST /api/user/watched
- [ ] On mount, check if the rolled film is already in the user's watchlist or watched list (call GET /api/user/watchlist and GET /api/user/watched), and show the correct icon states
- [ ] Handle loading spinners and error toasts for all watchlist/watched API calls
- [ ] Show the same action buttons on film detail pages (`/film/[slug]`) as well

### 15d. Frontend — Watchlist Page

- [ ] Create `src/app/profile/watchlist/page.tsx` — protected page (redirect to `/auth/signin` if not logged in)
- [ ] Fetch and display the user's watchlist as a responsive film grid
- [ ] Each card shows poster, title, year, award summary, and a "Remove" button
- [ ] Clicking a card navigates to the film detail page
- [ ] Show empty state: "Your watchlist is empty — roll some films to get started"
- [ ] Add a link to the watchlist page in the site header user menu (visible only when logged in)

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

## 18. Deployment

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

## 19. Documentation

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

## 20. Performance & Lighthouse Audit

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

## 21. Google Search Ranking (SEO)

Run this section after deployment. These steps go beyond Lighthouse's basic SEO score and target actual Google ranking for searches like "oscar nominated films filter", "random award winning movie", "golden globe movies by actor", etc.

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

---

## 🚀 Scalability & Future Improvements

- Current design supports 2000-2500 films efficiently
- To scale beyond: add caching layer (Redis), implement full-text search optimization, load balancing
- Future features: ratings and reviews, social watchlists (share with friends), collaborative filtering for recommendations
- Known limitations: content-based recommendations only (no collaborative filtering in MVP)
- Potential improvements: add E2E tests, implement analytics dashboard, social features (follow other users, see their watchlists)
