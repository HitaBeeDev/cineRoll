# CineRoll — Fullstack MVP Checklist (Text-Only)

---

## Application Summary

**CineRoll** is a film discovery web app built around a single core interaction: press **Roll**, get a random award-winning film you might have missed.

### What it does

- **Roll** — The main feature. One button returns a random film from the curated dataset, complete with poster, ratings, director, cast, plot, and award history.
- **Pick of the Day** — A manually curated featured film shown on the home page each day, selected from the dataset.
- **Browse & Search** — Users can explore the full catalogue filtered by title search, genre, and decade range, with paginated results.
- **Film Detail Pages** — Each film has a dedicated page (`/film/:slug`) showing full metadata: backdrop, trailer, IMDB/RT ratings, Oscar and Golden Globe history by category and year.

### The Dataset

Two hand-curated CSV files — one for Oscar records, one for Golden Globe records. Each row is a single nomination or win with: a unique award ID (`OSC-` / `GG-` prefix), the ceremony year, the film title, the film's release year, the award category, the nominee's name, and whether they won. The enrich script groups these records by film, calculates counts, and enriches each unique film via TMDB (poster, backdrop, runtime, genres, director, cast, trailer) and OMDB (IMDB rating, Rotten Tomatoes score). The final dataset is seeded into PostgreSQL.

### Stack

| Layer         | Technology                                                                      |
| ------------- | ------------------------------------------------------------------------------- |
| Frontend      | Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Framer Motion · Radix UI |
| Backend       | Node.js · Express 5 · Zod (validation)                                          |
| Database      | PostgreSQL (Neon) · Prisma ORM                                                  |
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
12. Frontend — Browse & Search
13. Frontend — Pages & Routing
14. Deployment
15. Documentation

---

## 1. Monorepo Setup

- [x] Create root project folder `cineroll` and initialize git
- [x] Initialize npm workspace by creating a root `package.json` with workspace declarations for frontend, backend, and packages/types
- [x] Set root `package.json` to private to prevent accidental publishing
- [x] Create root `.gitignore` to exclude node_modules, dist folders, environment files, and generated data files (films-enriched.json, films-final.json, enrichment-errors.csv)
- [x] Install root-level dev dependencies: Husky (for git hooks), lint-staged (for pre-commit linting), commitlint (for commit message validation), and concurrently (to run frontend + backend together)
- [x] Initialize Husky to set up git hooks infrastructure
- [x] Configure commit message linting with Conventional Commits format (feat:, fix:, docs:, etc.)
- [ ] Add pre-commit hook to run linting on staged TypeScript and TSX files
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
  - FilterState interface (search — matches film title OR nominee name, genre, decadeMin/Max, awardYear, category, winnerOnly toggle, page number)
  - PaginatedFilms interface (films array, total count, current page, total pages)
  - ApiError interface (error message, error code)
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
- [x] Run Prisma migration to create database schema: `prisma migrate dev --name init`
- [x] Verify database tables are created in Neon PostgreSQL console
- [x] Regenerate Prisma client: `prisma generate`
- [x] Create `backend/src/lib/prisma.ts` as a singleton instance of Prisma client for reuse across routes

---

## 5. Backend — Film Data Pipeline

### 5.0 Data File Preparation

- [x] Create `backend/data/` directory
- [x] Add data files to root `.gitignore` so they don't get committed
- [ ] Prepare `backend/data/films-oscar.csv` — one row per Oscar nomination/win with columns: `Id, Award Year, OSCie Name, Release Year, Type Of Award, Award Winner, Award Nominee`
  - `Id` format: `OSC-{year}-{nn}` (e.g. `OSC-1929-01`)
  - `Award Winner` = person/studio name if they won, `NaN` if nominated only
- [ ] Prepare `backend/data/films-goldenglobe.csv` — same column structure, `Id` format: `GG-{year}-{nn}`

### 5a. Enrichment Script — Fetch Data from TMDB & OMDB APIs

- [x] Install CSV parsing library (csv-parse) in backend
- [x] Create `backend/.env.local` with TMDB_API_KEY and OMDB_API_KEY (these are only for enrichment, not used at runtime)
- [x] Update `backend/src/scripts/enrich.ts` script to:
  - Load environment variables from .env.local
  - Read both `films-oscar.csv` and `films-goldenglobe.csv`
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
  - [x] GET /api/films (search with filters: `search` — matches film title OR nominee name, `genre`, `decadeMin`/`decadeMax` — release year range, `awardYear` — ceremony year, `category` — award category, `winnerOnly` — boolean to show only films where someone won vs all nominees, `page`, `limit`)
  - [x] GET /api/films/:slug (get single film by slug with full details including all AwardRecord arrays)
- [x] Create `backend/src/routes/random.ts` with:
  - [x] GET /api/random (return a random film from database)
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
- [ ] Use Prisma select to limit database columns returned: `{ select: { id: true, title: true, ... } }`
- [ ] Add HTTP caching headers: set Cache-Control headers appropriately for different endpoints
  - Pick of the day: cache for 1 hour
  - Random film: cache for 1 minute
  - Search results: cache for 5 minutes
  - Film detail: cache for 24 hours
- [ ] Test API response times: search should complete in under 200ms, single lookups under 100ms
- [ ] Monitor backend performance: check server logs for slow requests

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
- [ ] Define CSS variables for color scheme, spacing, typography
- [ ] Create root layout in `src/app/layout.tsx` with head, body, and theme provider setup
- [x] Add ESLint configuration to frontend

---

## 8. Frontend — Base Components & Performance Optimization

- [x] Create reusable UI components in `src/components/ui/`:
  - Button component (primary, secondary variants, sizes)
  - Card component (for film cards)
  - Skeleton component (loading placeholders)
  - Modal/Dialog component (for film details overlay)
  - Input/TextField component (for search)
  - Select component (for genre/decade filters)
  - Toast/Alert component (for error messages)
- [x] Create a Filter Bar component that combines search input, genre select, and decade range sliders
- [x] Create a Film Card component that displays poster, title, year, rating
- [x] Apply consistent styling using design tokens (colors, spacing, fonts)
- [x] Ensure all components have proper TypeScript types
- [x] Ensure accessibility: ARIA labels, semantic HTML, keyboard navigation

### Performance: Image Optimization (Lighthouse Metric: LCP)

- [ ] Use Next.js Image component for all images (poster, backdrop, etc.) instead of HTML img tag
- [ ] Image component automatically handles: lazy loading, responsive srcset, format optimization (WebP), caching
- [ ] Set explicit width and height on all Next.js Image components to prevent layout shift
- [ ] Configure image sizes in `next.config.js` to serve appropriately sized images for different breakpoints
- [ ] Use TMDB image optimization: prioritize small poster sizes, use thumbnail for initial load then higher resolution
- [ ] Add placeholder blur while images load (blurDataURL or placeholder="blur")
- [ ] Test: run Lighthouse, verify Largest Contentful Paint (LCP) is under 2.5 seconds

### Performance: Code Splitting & Bundle Size (Lighthouse Metric: FID/INP)

- [ ] Use dynamic imports for heavy components (FilmModal, FilmDetail, etc.) with React.lazy()
- [ ] Use Suspense boundaries with loading fallbacks for dynamic imports
- [ ] Split API calls: don't load unnecessary data on initial page load
- [ ] Defer non-critical JavaScript: analytics, tracking scripts should load after hydration
- [ ] Remove unused dependencies: audit package.json for unused packages
- [ ] Use tree-shaking: import only what you need from libraries
- [ ] Check bundle size: use `next/bundle-analyzer` or similar tool
- [ ] Target: keep main bundle under 200KB gzipped, all chunks under 250KB gzipped
- [ ] Test: run Lighthouse, verify First Input Delay (FID) under 100ms

### Performance: CSS Optimization (Lighthouse Metric: CLS)

- [ ] Minimize CSS using Tailwind CSS (production build automatically purges unused styles)
- [ ] Avoid inline styles; use Tailwind classes instead
- [ ] Minimize custom CSS in global styles
- [ ] Set explicit dimensions (width/height) on all media elements to prevent Cumulative Layout Shift (CLS)
- [ ] Test: run Lighthouse, verify CLS score (should be near 0)

### Performance: Font Optimization (Lighthouse Metric: LCP)

- [ ] Use system fonts or preload Google Fonts in `next.config.js`
- [ ] Use `font-display: swap` for custom fonts to prevent blank text (FOIT)
- [ ] Limit fonts: maximum 2-3 font families for production
- [ ] Use variable fonts to reduce file size
- [ ] Test: Lighthouse should show no font-related performance issues

### Accessibility (Lighthouse Metric: Accessibility Score)

- [ ] Audit color contrast ratios: ensure minimum 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- [ ] Use semantic HTML: proper heading hierarchy (h1, h2, h3), use `<button>` for buttons, `<a>` for links
- [ ] Add ARIA labels to interactive elements (buttons, form inputs, modals)
- [ ] Implement keyboard navigation: Tab through all interactive elements, Enter/Space to activate
- [ ] Test with screen reader: navigate entire page using keyboard only
- [ ] Images should have alt text (Next.js Image component requires alt)
- [ ] Ensure focus indicators are visible (don't remove default outline)
- [ ] Test: run axe DevTools extension, fix all accessibility violations

### SEO (Lighthouse Metric: SEO Score)

- [ ] Add meta viewport tag (Next.js does this by default)
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

- [ ] Use HTTPS everywhere (Vercel enforces this)
- [ ] Set security headers: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- [ ] No console errors or warnings in browser console
- [ ] Use CSP (Content Security Policy) headers
- [ ] Avoid deprecated APIs
- [ ] Use modern JavaScript (no need for transpiling unnecessarily old targets)
- [ ] Test: run Lighthouse, verify Best Practices score is 90+

### Lighthouse Testing & Iteration

- [ ] Install Lighthouse CI or use Lighthouse in Chrome DevTools
- [ ] Run Lighthouse audit on each page: home, browse, film detail
- [ ] Target scores: Performance 90+, Accessibility 90+, Best Practices 90+, SEO 90+
- [ ] Test on mobile and desktop separately (mobile is usually stricter)
- [ ] Monitor performance on actual slow connections: test with Chrome DevTools throttling (Slow 4G)
- [ ] Use WebPageTest or similar tool for real-world performance testing
- [ ] Set up CI/CD to fail builds if Lighthouse scores drop below threshold
- [ ] Document any unavoidable performance trade-offs and why

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

- [ ] Create `src/app/film/[slug]/page.tsx` dynamic route
- [ ] Fetch film data by slug from `/api/films/:slug` endpoint
- [ ] Display complete film information:
  - Large poster and backdrop images
  - Title, year, runtime, genres
  - Director and main cast
  - Full plot synopsis
  - IMDB and Rotten Tomatoes ratings with icons
  - Language information
- [ ] Display awards information:
  - Oscar nominations and wins (organized by category and year)
  - Golden Globe nominations and wins (organized by category and year)
  - Total award counts
- [ ] Embed or link YouTube trailer if available
- [ ] Add SEO metadata: dynamic title, description, Open Graph images, Twitter cards
- [ ] Create 404 page if film slug not found
- [ ] Make responsive: stack all content vertically on mobile, use grid layout on desktop
- [ ] Add "Back to Browse" or "Roll Again" navigation buttons

---

## 12. Frontend — Browse & Search

- [ ] Create `src/app/browse/page.tsx` (browse page)
- [ ] Implement Filter Bar with:
  - Text search input — searches both film titles and nominee/winner names (e.g. searching "Janet Gaynor" returns her films)
  - Genre multi-select dropdown
  - Decade range slider for release year (1920–2030)
  - Award year dropdown (filter by ceremony year, e.g. "1929 Oscars")
  - Category dropdown (Actor, Actress, Directing, Writing, etc.)
  - Winner/Nominee toggle — show only films where a category was won, or all nominees
- [ ] Sync filter state with URL query parameters so filters are shareable
- [ ] Implement pagination: display 12 films per page
- [ ] Create API function to call `/api/films?search=...&genre=...&decadeMin=...&decadeMax=...&awardYear=...&category=...&winnerOnly=...&page=...`
- [ ] Display results in responsive grid: 2 columns on mobile, 3 on tablet, 6 on desktop
- [ ] Show total film count and current page info
- [ ] Add loading skeletons while fetching results
- [ ] Handle empty results: show "No films found" message
- [ ] Implement pagination buttons: Previous, Next, with page number display
- [ ] Disable Previous button on page 1, disable Next on last page
- [ ] Make search real-time but debounced (don't call API on every keystroke)
- [ ] Make each film card clickable to open full detail page or modal

---

## 13. Frontend — Pages & Routing

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

## 14. Deployment

### Frontend Deployment to Vercel

- [ ] Push repository to GitHub
- [ ] Create new Vercel project and connect GitHub repository
- [ ] Set root directory to `frontend/`
- [ ] Set framework to Next.js
- [ ] Configure environment variable: NEXT_PUBLIC_API_URL pointing to backend URL
- [ ] Enable automatic deployments from main branch
- [ ] Setup custom domain (if desired) and configure DNS
- [ ] Verify SSL certificate is automatically provisioned
- [ ] Check Vercel analytics and performance monitoring
- [ ] Test: load home page, verify pick of day displays or shows fallback

### Backend Deployment to Railway

- [ ] Push repository to GitHub if not already done
- [ ] Create new Railway service and connect GitHub repository
- [ ] Set root directory to `backend/`
- [ ] Set build command to install dependencies and compile TypeScript
- [ ] Set start command to run compiled Node.js application
- [ ] Configure environment variables in Railway dashboard: DATABASE_URL (Neon connection), PORT, FRONTEND_URL (Vercel domain), TMDB_API_KEY, OMDB_API_KEY, NODE_ENV
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
- [ ] Setup monitoring and error tracking (e.g., Sentry)

---

## 15. Documentation

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
  - Why certain tech choices were made (Express vs Next.js API routes, PostgreSQL, Prisma, etc.)
- [ ] Create `DEPLOYMENT.md` with detailed steps for:
  - Frontend deployment to Vercel
  - Backend deployment to Railway
  - Database setup on Neon
  - Environment variables needed
  - Health checks to verify deployment
- [ ] Create `API_DOCS.md` documenting all endpoints:
  - GET /api/films (with query parameters for filtering)
  - GET /api/films/:slug (with example response)
  - GET /api/random (with example response)
  - GET /api/pick-of-day (with example response and 404 case)
  - POST /api/roll (request/response format)
  - All error responses and status codes
- [ ] Create `SETUP.md` with step-by-step local development instructions:
  - Clone repository
  - Install dependencies
  - Setup environment variables (.env files)
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
  - Performance and scalability considerations
- [ ] Create `CASE_STUDY.md` for portfolio:
  - Problem: Manual film discovery is tedious, IMDB is cluttered
  - Solution: Build CineRoll, a beautiful film discovery app with roll feature
  - Technical challenges: handling 2000+ films efficiently, typo-tolerant search, API integration
  - How you solved them: database indexing, pg_trgm, monorepo structure
  - Results: fast app, good user experience, production-deployed
  - What you learned
- [ ] Add code comments to complex logic in frontend and backend
- [ ] Create `.github/pull_request_template.md` for future contributions

---

## ✅ Success Verification Checklist

- [ ] All npm workspace dependencies install successfully
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Development server runs: `npm run dev` starts both backend and frontend
- [ ] Database is seeded with 2000+ films
- [ ] Frontend home page loads and displays a random film on "Roll"
- [ ] Browse page loads with search and filter functionality working
- [ ] Film detail page displays complete information when visiting /film/:slug
- [ ] Dark mode toggle works and persists on page reload
- [ ] All pages are responsive on mobile, tablet, and desktop
- [ ] Backend API returns proper error responses for invalid requests
- [ ] Deployment to Vercel and Railway succeeds with no build errors
- [ ] Frontend and backend are properly configured with environment variables
- [ ] Health check endpoint responds successfully
- [ ] End-to-end test: Roll → see result → click to detail page → view full information → works on mobile
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

## 🚀 Scalability & Future Improvements

- Current design supports 2000-2500 films efficiently
- To scale beyond: add caching layer (Redis), implement full-text search optimization, load balancing
- Future features: user accounts and watchlists, ratings and reviews, recommendations, advanced filters
- Known limitations: no user accounts in MVP, no advanced recommendation algorithm
- Potential improvements: add E2E tests, implement analytics dashboard, add content moderation for user reviews
