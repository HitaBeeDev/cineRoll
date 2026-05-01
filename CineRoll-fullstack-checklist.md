# CineRoll — Fullstack MVP Checklist

### Next.js Frontend · Node.js/Express Backend · PostgreSQL (Neon) · Prisma

> **Monorepo structure:** `cineroll/` root contains `frontend/` (Next.js) and `backend/` (Express). Shared types live in `packages/types/`. One repo, two deployable services.

---

## Build Order

1. Monorepo Setup
2. Shared Types Package
3. Backend — Project Setup
4. Backend — Database & Prisma
5. Backend — Film Data Pipeline
6. Backend — API
7. Frontend — Project Setup
8. Frontend — Base Components
9. Frontend — Roll
10. Frontend — Pick of the Day
11. Frontend — Film Detail
12. Frontend — Browse & Search
13. Frontend — Pages
14. Deployment
15. Documentation

---

## 1. Monorepo Setup

- [x] Create root folder and initialise workspace:
  ```bash
  mkdir cineroll && cd cineroll
  git init
  npm init -y
  ```
- [x] Set `"private": true` and add workspaces to root `package.json`:
  ```json
  {
    "private": true,
    "workspaces": ["frontend", "backend", "packages/*"]
  }
  ```
- [x] Create root `.gitignore`:
  ```
  node_modules/
  dist/
  .env
  .env.local
  data/films-enriched.json
  data/films-final.json
  data/enrichment-errors.csv
  ```
- [ ] Install root dev tools:
  ```bash
  npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional concurrently
  ```
- [ ] Initialise Husky: `npx husky init`
- [ ] Create `commitlint.config.ts` at root:
  ```ts
  export default { extends: ["@commitlint/config-conventional"] };
  ```
- [ ] Add Husky `commit-msg` hook:
  ```bash
  echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
  ```
- [ ] Add Husky `pre-commit` hook: `echo "npx lint-staged" > .husky/pre-commit`
- [ ] Add `lint-staged` config to root `package.json`:
  ```json
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --max-warnings 0"]
  }
  ```
- [ ] Create root `tsconfig.base.json`:
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noUncheckedIndexedAccess": true,
      "exactOptionalPropertyTypes": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    }
  }
  ```
- [ ] Add root scripts to `package.json`:
  ```json
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace=backend\" \"npm run dev --workspace=frontend\"",
    "build": "npm run build --workspace=backend && npm run build --workspace=frontend",
    "lint": "npm run lint --workspace=backend && npm run lint --workspace=frontend",
    "type-check": "npm run type-check --workspace=backend && npm run type-check --workspace=frontend"
  }
  ```
- [ ] Verify workspace resolution: `npm ls --workspaces` — should list frontend, backend, packages/types

---

## 2. Shared Types Package

- [ ] Create folder: `mkdir -p packages/types/src`
- [ ] Create `packages/types/package.json`:
  ```json
  {
    "name": "@cineroll/types",
    "version": "0.0.1",
    "main": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "scripts": {
      "build": "tsc",
      "dev": "tsc --watch"
    }
  }
  ```
- [ ] Create `packages/types/tsconfig.json`:
  ```json
  {
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
      "outDir": "./dist",
      "declaration": true,
      "module": "CommonJS",
      "target": "ES2020"
    },
    "include": ["src"]
  }
  ```
- [ ] Create `packages/types/src/index.ts`:

  ```ts
  export interface AwardCategory {
    category: string;
    year: number;
    won: boolean;
  }

  export interface Film {
    id: string;
    slug: string;
    tmdbId: number | null;
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

  export interface RollEvent {
    id: string;
    filmId: string;
    rolledAt: string;
  }

  export interface FilterState {
    search: string;
    genre: string;
    decadeMin: number;
    decadeMax: number;
    page: number;
  }

  export interface PaginatedFilms {
    films: Film[];
    total: number;
    page: number;
    totalPages: number;
  }

  export interface ApiError {
    error: string;
    code: string;
  }
  ```

- [ ] Build: `npm run build --workspace=packages/types`
- [ ] Verify `packages/types/dist/index.d.ts` exists

---

## 3. Backend — Project Setup

- [ ] Create folder and init: `mkdir backend && cd backend && npm init -y`
- [ ] Set `name: "@cineroll/backend"` and add `"@cineroll/types": "*"` to dependencies in `backend/package.json`
- [ ] Install production dependencies:
  ```bash
  npm install express cors helmet morgan dotenv @prisma/client zod
  ```
- [ ] Install dev dependencies:
  ```bash
  npm install -D typescript ts-node-dev @types/express @types/cors @types/morgan @types/node prisma tsx
  ```
- [ ] Create `backend/tsconfig.json`:
  ```json
  {
    "extends": "../tsconfig.base.json",
    "compilerOptions": {
      "outDir": "./dist",
      "rootDir": "./src",
      "module": "CommonJS",
      "target": "ES2020"
    },
    "include": ["src"]
  }
  ```
- [ ] Add scripts to `backend/package.json`:
  ```json
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "npx tsx src/scripts/seed.ts",
    "enrich": "npx tsx src/scripts/enrich.ts"
  }
  ```
- [ ] Create `backend/.env` (add to root `.gitignore`):
  ```
  DATABASE_URL=postgresql://...
  PORT=4000
  FRONTEND_URL=http://localhost:3000
  ```
- [ ] Create `backend/.env.example`:
  ```
  DATABASE_URL=postgresql://user:pass@host/db
  PORT=4000
  FRONTEND_URL=http://localhost:3000
  ```
- [ ] Create folder structure:
  ```
  backend/src/
  ├── index.ts
  ├── app.ts
  ├── config.ts
  ├── lib/prisma.ts
  ├── middleware/
  │   ├── errorHandler.ts
  │   └── validate.ts
  ├── routes/
  │   ├── index.ts
  │   ├── films.ts
  │   ├── random.ts
  │   ├── roll.ts
  │   └── pickOfDay.ts
  └── scripts/
      ├── enrich.ts
      └── seed.ts
  ```
- [ ] Create `backend/src/config.ts`:

  ```ts
  import "dotenv/config";

  function required(key: string): string {
    const val = process.env[key];
    if (!val) throw new Error(`Missing required env var: ${key}`);
    return val;
  }

  export const config = {
    port: parseInt(process.env["PORT"] ?? "4000", 10),
    databaseUrl: required("DATABASE_URL"),
    frontendUrl: process.env["FRONTEND_URL"] ?? "http://localhost:3000",
  };
  ```

- [ ] Create `backend/src/lib/prisma.ts`:

  ```ts
  import { PrismaClient } from "@prisma/client";

  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

  export const prisma =
    globalForPrisma.prisma ?? new PrismaClient({ log: ["warn", "error"] });

  if (process.env["NODE_ENV"] !== "production") globalForPrisma.prisma = prisma;
  ```

- [ ] Create `backend/src/app.ts`:

  ```ts
  import express from "express";
  import cors from "cors";
  import helmet from "helmet";
  import morgan from "morgan";
  import { config } from "./config";
  import { router } from "./routes";
  import { errorHandler } from "./middleware/errorHandler";

  export const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.frontendUrl, credentials: true }));
  app.use(morgan("dev"));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/api", router);
  app.use(errorHandler);
  ```

- [ ] Create `backend/src/index.ts`:

  ```ts
  import { app } from "./app";
  import { config } from "./config";

  app.listen(config.port, () => {
    console.log(`Backend running on http://localhost:${config.port}`);
  });
  ```

- [ ] Create `backend/src/middleware/errorHandler.ts`:

  ```ts
  import { Request, Response, NextFunction } from "express";

  export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal server error", code: "INTERNAL_ERROR" });
  }
  ```

- [ ] Create `backend/src/middleware/validate.ts`:

  ```ts
  import { Request, Response, NextFunction } from "express";
  import { ZodSchema } from "zod";

  export function validate(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      const result = schema.safeParse(req.query);
      if (!result.success) {
        res
          .status(400)
          .json({ error: result.error.message, code: "VALIDATION_ERROR" });
        return;
      }
      req.query = result.data;
      next();
    };
  }
  ```

- [ ] Run `npm run type-check --workspace=backend` — must pass before continuing

---

## 4. Backend — Database & Prisma

- [ ] Run `npx prisma init` from `backend/`
- [ ] Replace contents of `backend/prisma/schema.prisma`:

  ```prisma
  generator client {
    provider = "prisma-client-js"
  }

  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }

  model Film {
    id               String      @id @default(cuid())
    slug             String      @unique
    tmdbId           Int?        @unique
    imdbId           String?     @unique
    title            String
    year             Int
    runtime          Int?
    genres           String[]
    plot             String?
    director         String?
    cast             Json        @default("[]")
    language         String?
    posterUrl        String?
    backdropUrl      String?
    trailerUrl       String?
    imdbRating       Float?
    rtScore          Int?
    oscarNominations Int         @default(0)
    oscarWins        Int         @default(0)
    oscarCategories  Json        @default("[]")
    ggNominations    Int         @default(0)
    ggWins           Int         @default(0)
    ggCategories     Json        @default("[]")
    isPickOfDay      Boolean     @default(false)
    pickOfDayDate    DateTime?
    rollEvents       RollEvent[]
    createdAt        DateTime    @default(now())
    updatedAt        DateTime    @updatedAt
  }

  model RollEvent {
    id       String   @id @default(cuid())
    filmId   String
    film     Film     @relation(fields: [filmId], references: [id])
    rolledAt DateTime @default(now())

    @@index([filmId, rolledAt])
  }
  ```

- [ ] Run migration: `npm run db:migrate --workspace=backend` — name it `init`
- [ ] Run `npm run db:generate --workspace=backend`
- [ ] In Neon SQL editor, enable trigram extension:
  ```sql
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
  ```
- [ ] In Neon SQL editor, create GIN index:
  ```sql
  CREATE INDEX films_title_trgm_idx ON "Film" USING GIN (title gin_trgm_ops);
  ```
- [ ] Verify both exist:
  ```sql
  SELECT extname FROM pg_extension WHERE extname = 'pg_trgm';
  SELECT indexname FROM pg_indexes WHERE tablename = 'Film';
  ```

---

## 5. Backend — Film Data Pipeline

### 5a. Clean

- [ ] Paste raw film list into Google Sheets; add columns `title`, `year`, `keep`, `notes`
- [ ] Delete all TV shows, TV movies, talk shows, award ceremony broadcasts, non-film entries
- [ ] Sort by title; delete all exact duplicates
- [ ] Identify near-duplicates (same film, different spelling); keep correctly cased entry, delete the rest
- [ ] Fix all title casing errors and typos
- [ ] Fill in missing years where identifiable; remove entries with no identifiable year
- [ ] Verify 2025–2026 entries are released; remove any unreleased titles
- [ ] Export as `backend/data/films-clean.csv` with columns `title,year` (target: 2000–2500 rows)

### 5b. Enrich

- [ ] Install CSV parser in backend: `npm install -D csv-parse`
- [ ] Create `backend/.env.local` (enrichment keys — not used at runtime):
  ```
  TMDB_API_KEY=your_key
  OMDB_API_KEY=your_key
  ```
- [ ] Create `backend/src/scripts/enrich.ts` with the following logic in order:
  - Load `.env.local`: `import dotenv from "dotenv"; dotenv.config({ path: ".env.local" });`
  - Read `backend/data/films-clean.csv` using `csv-parse/sync` `parse()` with `{ columns: true, skip_empty_lines: true }`
  - Define helper `sleep = (ms: number) => new Promise(r => setTimeout(r, ms))`
  - Define `generateSlug(title: string, year: number, seen: Set<string>): string`:
    - lowercase title, replace spaces with hyphens, strip anything not alphanumeric or hyphen
    - if slug already in `seen`, append `-${year}`
    - add final slug to `seen`; return it
  - Open a write stream to `backend/data/enrichment-errors.csv`; write header line `title,year,reason\n`
  - Initialise empty `results` array and `seenSlugs` Set
  - For each CSV row:
    1. `GET https://api.themoviedb.org/3/search/movie?query={title}&year={year}&api_key={key}`
    2. If `results.length === 0`: append `${title},${year},no_tmdb_result\n` to errors; `continue`
    3. From `results[0]`: extract `tmdbId`, `posterUrl`, `backdropUrl`, `overview`
    4. `GET https://api.themoviedb.org/3/movie/{tmdbId}?append_to_response=credits,videos,external_ids&api_key={key}`
    5. Extract `imdbId` (`external_ids.imdb_id`), `runtime`, `genres` (map to `.name`), `director` (`credits.crew.find(c => c.job === "Director")?.name ?? null`), `cast` (`credits.cast.slice(0, 10).map(c => c.name)`)
    6. From `videos.results`: find first where `type === "Trailer" && site === "YouTube"`; store full YouTube URL or `null`
    7. If `imdbId`: `GET http://www.omdbapi.com/?i={imdbId}&apikey={key}`; parse `imdbRating` as `parseFloat`; find RT entry in `Ratings[]` and parse its `Value` as `parseInt`
    8. Generate slug: `generateSlug(title, year, seenSlugs)`
    9. Push assembled film object to `results`
    10. `await sleep(250)`
  - Write `JSON.stringify(results, null, 2)` to `backend/data/films-enriched.json`
  - Close error stream; log `Enriched: ${results.length}, Errors: ${errorCount}`
- [ ] Run `npm run enrich --workspace=backend`
- [ ] Review `backend/data/enrichment-errors.csv`; fix or remove each entry; re-run if changes made
- [ ] Validate: `new Set(films.map(f => f.slug)).size === films.length` (no duplicate slugs); spot-check 20 random entries

### 5c. Augment

- [ ] For each film with Oscar history, add `oscarCategories`, `oscarNominations`, `oscarWins` to `films-enriched.json`
- [ ] For each film with Golden Globe history, add `ggCategories`, `ggNominations`, `ggWins`
- [ ] Add `language` field to every film (e.g. `"English"`, `"French"`, `"Korean"`)
- [ ] Manually correct any stale or missing RT scores
- [ ] Save as `backend/data/films-final.json` — do not overwrite after seeding

### 5d. Seed

- [ ] Create `backend/src/scripts/seed.ts`:

  ```ts
  import { prisma } from "../lib/prisma";
  import filmsData from "../../data/films-final.json";

  async function main() {
    console.log(`Seeding ${filmsData.length} films...`);
    for (const film of filmsData) {
      await prisma.film.upsert({
        where: { slug: film.slug },
        // Pass Json fields directly — Prisma accepts plain arrays/objects for Json columns
        update: {
          ...film,
          cast: film.cast,
          oscarCategories: film.oscarCategories,
          ggCategories: film.ggCategories,
        },
        create: {
          ...film,
          cast: film.cast,
          oscarCategories: film.oscarCategories,
          ggCategories: film.ggCategories,
        },
      });
    }
    console.log("Seed complete.");
  }

  main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
  ```

- [ ] Run `npm run db:seed --workspace=backend`
- [ ] In Neon console: verify row count matches `films-final.json` length
- [ ] Spot-check 5 films by querying slug in Neon SQL editor

---

## 6. Backend — API Routes

- [ ] Create `backend/src/routes/index.ts`:

  ```ts
  import { Router } from "express";
  import filmsRouter from "./films";
  import randomRouter from "./random";
  import rollRouter from "./roll";
  import pickOfDayRouter from "./pickOfDay";

  export const router = Router();
  router.use("/films", filmsRouter);
  router.use("/random", randomRouter);
  router.use("/roll", rollRouter);
  router.use("/pick-of-day", pickOfDayRouter);
  ```

- [ ] Create `backend/src/routes/pickOfDay.ts`:

  ```ts
  import { Router } from "express";
  import { prisma } from "../lib/prisma";

  const router = Router();

  router.get("/", async (_req, res, next) => {
    try {
      const film = await prisma.film.findFirst({
        where: { isPickOfDay: true },
        orderBy: { pickOfDayDate: "desc" },
      });
      if (!film) {
        res
          .status(404)
          .json({ error: "No pick of day set", code: "NOT_FOUND" });
        return;
      }
      res.json(film);
    } catch (err) {
      next(err);
    }
  });

  export default router;
  ```

- [ ] Create `backend/src/routes/random.ts`:

  ```ts
  import { Router } from "express";
  import { prisma } from "../lib/prisma";
  import type { Film } from "@cineroll/types";

  const router = Router();

  router.get("/", async (_req, res, next) => {
    try {
      const results = await prisma.$queryRaw<Film[]>`
        SELECT * FROM "Film" ORDER BY RANDOM() LIMIT 1
      `;
      if (!results[0]) {
        res.status(404).json({ error: "No films found", code: "NOT_FOUND" });
        return;
      }
      res.json(results[0]);
    } catch (err) {
      next(err);
    }
  });

  export default router;
  ```

- [ ] Create `backend/src/routes/roll.ts`:

  ```ts
  import { Router } from "express";
  import { z } from "zod";
  import { prisma } from "../lib/prisma";

  const router = Router();
  const bodySchema = z.object({ filmId: z.string().min(1) });

  router.post("/", async (req, res, next) => {
    try {
      const result = bodySchema.safeParse(req.body);
      if (!result.success) {
        res
          .status(400)
          .json({ error: result.error.message, code: "VALIDATION_ERROR" });
        return;
      }
      const { filmId } = result.data;
      const film = await prisma.film.findUnique({ where: { id: filmId } });
      if (!film) {
        res.status(404).json({ error: "Film not found", code: "NOT_FOUND" });
        return;
      }
      await prisma.rollEvent.create({ data: { filmId } });
      res.status(201).json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  export default router;
  ```

- [ ] Create `backend/src/routes/films.ts`:

  ```ts
  import { Router } from "express";
  import { z } from "zod";
  import { prisma } from "../lib/prisma";
  import { validate } from "../middleware/validate";
  import type { Film } from "@cineroll/types";

  const router = Router();

  const listSchema = z.object({
    search: z.string().optional(),
    genre: z.string().optional(),
    decade_min: z.coerce.number().min(1900).max(2100).optional(),
    decade_max: z.coerce.number().min(1900).max(2100).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(48),
  });

  // GET /api/films
  router.get("/", validate(listSchema), async (req, res, next) => {
    try {
      const { search, genre, decade_min, decade_max, page, limit } =
        req.query as z.infer<typeof listSchema>;
      const skip = (page - 1) * limit;

      if (search) {
        const pattern = `%${search}%`;
        const films = await prisma.$queryRaw<Film[]>`
          SELECT * FROM "Film"
          WHERE similarity(title, ${search}) > 0.2 OR title ILIKE ${pattern}
          ORDER BY similarity(title, ${search}) DESC
          LIMIT ${limit} OFFSET ${skip}
        `;
        const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) FROM "Film"
          WHERE similarity(title, ${search}) > 0.2 OR title ILIKE ${pattern}
        `;
        const total = Number(countResult[0]?.count ?? 0);
        res.json({ films, total, page, totalPages: Math.ceil(total / limit) });
        return;
      }

      const where = {
        ...(genre ? { genres: { has: genre } } : {}),
        ...(decade_min || decade_max
          ? { year: { gte: decade_min, lte: decade_max } }
          : {}),
      };

      const [films, total] = await prisma.$transaction([
        prisma.film.findMany({
          where,
          skip,
          take: limit,
          orderBy: { title: "asc" },
        }),
        prisma.film.count({ where }),
      ]);

      res.json({ films, total, page, totalPages: Math.ceil(total / limit) });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/films/:slug
  router.get("/:slug", async (req, res, next) => {
    try {
      const film = await prisma.film.findUnique({
        where: { slug: req.params["slug"] },
      });
      if (!film) {
        res.status(404).json({ error: "Film not found", code: "NOT_FOUND" });
        return;
      }
      res.json(film);
    } catch (err) {
      next(err);
    }
  });

  export default router;
  ```

- [ ] Smoke test with curl or Bruno:
  - `GET http://localhost:4000/health` → `{ ok: true }`
  - `GET http://localhost:4000/api/random` → a film object
  - `GET http://localhost:4000/api/films?search=godfater` → trgm results despite typo
  - `GET http://localhost:4000/api/films?genre=Drama&decade_min=1990&decade_max=1999` → filtered
  - `POST http://localhost:4000/api/roll` body `{ "filmId": "<valid id>" }` → 201
  - `GET http://localhost:4000/api/pick-of-day` → 404 (none set yet)
  - `GET http://localhost:4000/api/films/the-godfather-1972` → film object

---

## 7. Frontend — Project Setup

- [ ] Scaffold from monorepo root:
  ```bash
  npx create-next-app@latest frontend --typescript --tailwind --app --eslint --no-src-dir
  ```
- [ ] Add to `frontend/package.json` dependencies: `"@cineroll/types": "*"`
- [ ] Install frontend dependencies:
  ```bash
  npm install framer-motion @radix-ui/react-dialog @radix-ui/react-slider @radix-ui/react-toggle-group @radix-ui/react-toast @radix-ui/react-visually-hidden clsx tailwind-merge
  ```
- [ ] Update `frontend/tsconfig.json`:
  ```json
  {
    "extends": "../tsconfig.base.json",
    "compilerOptions": {
      "paths": {
        "@/*": ["./*"],
        "@cineroll/types": ["../packages/types/src"]
      },
      "plugins": [{ "name": "next" }]
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    "exclude": ["node_modules"]
  }
  ```
- [ ] Update `frontend/tailwind.config.ts`:

  ```ts
  import type { Config } from "tailwindcss";

  const config: Config = {
    darkMode: "class",
    content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
    theme: {
      extend: {
        colors: {
          primary: "var(--color-primary)",
          accent: "var(--color-accent)",
          surface: "var(--color-surface)",
          "surface-raised": "var(--color-surface-raised)",
          "text-base": "var(--color-text)",
          muted: "var(--color-muted)",
          border: "var(--color-border)",
        },
      },
    },
    plugins: [],
  };

  export default config;
  ```

- [ ] Update `frontend/next.config.ts`:
  ```ts
  const config = {
    images: {
      remotePatterns: [{ hostname: "image.tmdb.org" }],
    },
  };
  export default config;
  ```
- [ ] Update `frontend/app/globals.css` — CSS variable definitions only, no utility classes:

  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  :root {
    --color-primary: #e50914;
    --color-accent: #f5c518;
    --color-surface: #0a0a0a;
    --color-surface-raised: #1a1a1a;
    --color-text: #f5f5f5;
    --color-muted: #9ca3af;
    --color-border: #2a2a2a;
  }

  .dark {
    --color-surface: #050505;
    --color-surface-raised: #111111;
  }
  ```

- [ ] Create `frontend/.env.local`:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:4000
  ```
- [ ] Create `frontend/.env.example`:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:4000
  ```
- [ ] Create `frontend/lib/api.ts`:

  ```ts
  const BASE = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";

  export async function apiFetch<T>(
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    const res = await fetch(`${BASE}/api${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(
        (body as { error?: string }).error ?? `HTTP ${res.status}`,
      );
    }
    return res.json() as Promise<T>;
  }
  ```

- [ ] Create `frontend/lib/utils.ts`:

  ```ts
  import { type ClassValue, clsx } from "clsx";
  import { twMerge } from "tailwind-merge";

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }

  export function formatRuntime(minutes: number | null): string {
    if (!minutes) return "";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  export function isToday(dateStr: string | null): boolean {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }
  ```

- [ ] Create `frontend/app/layout.tsx`:

  ```tsx
  import type { Metadata } from "next";
  import "./globals.css";
  import { Header } from "@/components/layout/Header";
  import { Footer } from "@/components/layout/Footer";
  import { ToastProvider } from "@/components/ui/Toast";

  export const metadata: Metadata = {
    title: "CineRoll",
    description: "Discover films, one roll at a time.",
  };

  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          {/*
            Inline script runs before React hydrates — prevents flash of wrong theme.
            Reads localStorage; falls back to system preference.
          */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  const stored = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (stored === 'dark' || (!stored && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (_) {}
              `,
            }}
          />
        </head>
        <body className="bg-surface text-text-base antialiased">
          <ToastProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </ToastProvider>
        </body>
      </html>
    );
  }
  ```

- [ ] Create all folders: `components/ui`, `components/film`, `components/roll`, `components/home`, `components/filters`, `components/layout`, `hooks`, `lib`
- [ ] Run `npm run type-check --workspace=frontend` — must pass before continuing

---

## 8. Frontend — Base Components

> **Rule:** all Tailwind utilities live in JSX `className`. No `@apply`, no utility classes in `globals.css`.

- [ ] Create `components/ui/Button.tsx`:

  ```tsx
  import { cn } from "@/lib/utils";

  type Variant = "primary" | "secondary" | "ghost";

  interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    loading?: boolean;
  }

  const variants: Record<Variant, string> = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "border border-border text-text-base hover:bg-surface-raised",
    ghost: "text-muted hover:text-text-base",
  };

  export function Button({
    variant = "primary",
    loading,
    disabled,
    className,
    children,
    ...props
  }: ButtonProps) {
    return (
      <button
        {...props}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
          variants[variant],
          (disabled || loading) &&
            "pointer-events-none cursor-not-allowed opacity-50",
          className,
        )}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
  ```

- [ ] Create `components/ui/Badge.tsx`:

  ```tsx
  import { cn } from "@/lib/utils";

  interface BadgeProps {
    label: string;
    variant?: "genre" | "award";
    className?: string;
  }

  export function Badge({ label, variant = "genre", className }: BadgeProps) {
    return (
      <span
        className={cn(
          "inline-block rounded-full px-2 py-0.5 text-xs",
          variant === "genre" && "bg-surface-raised text-muted",
          variant === "award" && "bg-accent/10 font-semibold text-accent",
          className,
        )}
      >
        {label}
      </span>
    );
  }
  ```

- [ ] Create `components/ui/Skeleton.tsx`:

  ```tsx
  import { cn } from "@/lib/utils";

  export function Skeleton({ className }: { className?: string }) {
    return (
      <div
        className={cn("animate-pulse rounded bg-surface-raised", className)}
      />
    );
  }
  ```

- [ ] Create `components/ui/Toast.tsx`:

  ```tsx
  "use client";
  import * as RadixToast from "@radix-ui/react-toast";
  import { createContext, useContext, useState, useCallback } from "react";
  import { cn } from "@/lib/utils";

  type ToastVariant = "success" | "error";
  interface ToastMessage {
    id: number;
    message: string;
    variant: ToastVariant;
  }

  const ToastContext = createContext<{
    toast: (msg: { message: string; variant: ToastVariant }) => void;
  }>({ toast: () => {} });

  export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const toast = useCallback(
      ({ message, variant }: { message: string; variant: ToastVariant }) => {
        setToasts((prev) => [...prev, { id: Date.now(), message, variant }]);
      },
      [],
    );

    return (
      <ToastContext.Provider value={{ toast }}>
        <RadixToast.Provider swipeDirection="right">
          {children}
          {toasts.map((t) => (
            <RadixToast.Root
              key={t.id}
              onOpenChange={(open) => {
                if (!open)
                  setToasts((prev) => prev.filter((x) => x.id !== t.id));
              }}
              className={cn(
                "rounded-lg border-l-4 bg-surface-raised p-4 shadow-lg",
                t.variant === "success" ? "border-green-500" : "border-red-500",
              )}
            >
              <RadixToast.Description className="text-sm text-text-base">
                {t.message}
              </RadixToast.Description>
            </RadixToast.Root>
          ))}
          <RadixToast.Viewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" />
        </RadixToast.Provider>
      </ToastContext.Provider>
    );
  }

  export function useToast() {
    return useContext(ToastContext);
  }
  ```

- [ ] Create `components/ui/Dialog.tsx`:

  ```tsx
  "use client";
  import * as RadixDialog from "@radix-ui/react-dialog";
  import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

  export const Dialog = RadixDialog.Root;
  export const DialogTrigger = RadixDialog.Trigger;
  export const DialogClose = RadixDialog.Close;

  export function DialogContent({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) {
    return (
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <RadixDialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-surface p-6 shadow-2xl focus:outline-none">
          <VisuallyHidden asChild>
            <RadixDialog.Title>{title}</RadixDialog.Title>
          </VisuallyHidden>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    );
  }
  ```

- [ ] Create `components/layout/ThemeToggle.tsx`:

  ```tsx
  "use client";
  import { useEffect, useState } from "react";

  export function ThemeToggle() {
    const [dark, setDark] = useState(false);

    useEffect(() => {
      setDark(document.documentElement.classList.contains("dark"));
    }, []);

    function toggle() {
      const next = !dark;
      setDark(next);
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
    }

    return (
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="rounded-md p-2 text-muted transition-colors hover:text-text-base"
      >
        {dark ? (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            />
          </svg>
        )}
      </button>
    );
  }
  ```

- [ ] Create `components/layout/Header.tsx`:

  ```tsx
  import Link from "next/link";
  import { ThemeToggle } from "./ThemeToggle";

  export function Header() {
    return (
      <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-primary"
          >
            CineRoll
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/browse"
              className="text-sm text-muted transition-colors hover:text-text-base"
            >
              Browse
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>
    );
  }
  ```

- [ ] Create `components/layout/Footer.tsx`:
  ```tsx
  export function Footer() {
    return (
      <footer className="border-t border-border py-8 text-center text-sm text-muted">
        <p>Discover films, one roll at a time.</p>
        <p className="mt-1">
          This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </p>
      </footer>
    );
  }
  ```

---

## 9. Frontend — Roll

- [ ] Create `hooks/useRoll.ts`:

  ```ts
  "use client";
  import { useState } from "react";
  import { apiFetch } from "@/lib/api";
  import { useToast } from "@/components/ui/Toast";
  import type { Film } from "@cineroll/types";

  export type RollState = "idle" | "loading" | "revealed" | "re-rolling";

  export function useRoll() {
    const [state, setState] = useState<RollState>("idle");
    const [film, setFilm] = useState<Film | null>(null);
    const { toast } = useToast();

    async function fetchRoll(): Promise<Film> {
      const fetched = await apiFetch<Film>("/random");
      await apiFetch("/roll", {
        method: "POST",
        body: JSON.stringify({ filmId: fetched.id }),
      });
      return fetched;
    }

    async function roll() {
      setState("loading");
      try {
        setFilm(await fetchRoll());
        setState("revealed");
      } catch {
        setState("idle");
        toast({
          message: "Something went wrong. Try again.",
          variant: "error",
        });
      }
    }

    async function reRoll() {
      setState("re-rolling");
      try {
        setFilm(await fetchRoll());
        setState("revealed");
      } catch {
        setState("revealed"); // keep current film visible on re-roll failure
        toast({
          message: "Couldn't roll again. Try once more.",
          variant: "error",
        });
      }
    }

    return { state, film, roll, reRoll };
  }
  ```

- [ ] Create `components/roll/RollSection.tsx` — lifts roll state so all three sub-components share it:

  ```tsx
  "use client";
  import { useRoll } from "@/hooks/useRoll";
  import { RollButton } from "./RollButton";
  import { RollLoader } from "./RollLoader";
  import { RollResult } from "./RollResult";

  export function RollSection() {
    const { state, film, roll, reRoll } = useRoll();
    return (
      <div className="flex flex-col items-center gap-6">
        {state === "idle" && <RollButton onRoll={roll} loading={false} />}
        {state === "loading" && (
          <>
            <RollButton onRoll={roll} loading={true} />
            <RollLoader />
          </>
        )}
        {(state === "revealed" || state === "re-rolling") && film && (
          <RollResult
            film={film}
            reRoll={reRoll}
            isReRolling={state === "re-rolling"}
          />
        )}
      </div>
    );
  }
  ```

- [ ] Create `components/roll/RollButton.tsx`:

  ```tsx
  import { Button } from "@/components/ui/Button";

  interface Props {
    onRoll: () => void;
    loading: boolean;
  }

  export function RollButton({ onRoll, loading }: Props) {
    return (
      <Button
        variant="primary"
        loading={loading}
        onClick={onRoll}
        className="rounded-full px-10 py-4 text-lg font-semibold shadow-lg active:scale-95"
      >
        {loading ? "Finding..." : "Roll"}
      </Button>
    );
  }
  ```

- [ ] Create `components/roll/RollLoader.tsx`:

  ```tsx
  import { motion } from "framer-motion";
  import { Skeleton } from "@/components/ui/Skeleton";

  export function RollLoader() {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center gap-4"
      >
        <Skeleton className="h-96 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
      </motion.div>
    );
  }
  ```

- [ ] Create `components/roll/RollResult.tsx`:

  ```tsx
  "use client";
  import Image from "next/image";
  import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
  import { Button } from "@/components/ui/Button";
  import { ScoreBadge } from "@/components/film/ScoreBadge";
  import { FilmModal } from "@/components/film/FilmModal";
  import type { Film } from "@cineroll/types";

  interface Props {
    film: Film;
    reRoll: () => void;
    isReRolling: boolean;
  }

  export function RollResult({ film, reRoll, isReRolling }: Props) {
    const reduced = useReducedMotion();
    const anim = reduced
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 },
        };

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={film.id}
          {...anim}
          className="flex flex-col items-center gap-4"
        >
          {film.posterUrl && (
            <Image
              src={film.posterUrl}
              alt={film.title}
              width={256}
              height={384}
              className="rounded-lg shadow-xl"
            />
          )}
          <h2 className="text-2xl font-bold text-text-base">{film.title}</h2>
          <p className="text-muted">
            {film.year}
            {film.director ? ` · ${film.director}` : ""}
          </p>
          <div className="flex gap-2">
            <ScoreBadge variant="imdb" score={film.imdbRating} />
            <ScoreBadge variant="rt" score={film.rtScore} />
          </div>
          <div className="flex gap-3">
            <FilmModal film={film}>
              <Button variant="secondary">View Film</Button>
            </FilmModal>
            <Button variant="ghost" loading={isReRolling} onClick={reRoll}>
              Roll Again
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }
  ```

---

## 10. Frontend — Pick of the Day

- [ ] Create `components/home/PickOfTheDay.tsx`:

  ```tsx
  "use client";
  import Image from "next/image";
  import { useState, useEffect } from "react";
  import { motion, useReducedMotion } from "framer-motion";
  import { apiFetch } from "@/lib/api";
  import { isToday } from "@/lib/utils";
  import { Skeleton } from "@/components/ui/Skeleton";
  import { Button } from "@/components/ui/Button";
  import { ScoreBadge } from "@/components/film/ScoreBadge";
  import { FilmModal } from "@/components/film/FilmModal";
  import type { Film } from "@cineroll/types";

  export function PickOfTheDay({ initialFilm }: { initialFilm: Film | null }) {
    const [film, setFilm] = useState<Film | null>(initialFilm);
    const [loading, setLoading] = useState(!initialFilm);
    const [error, setError] = useState(false);
    const reduced = useReducedMotion();

    async function load() {
      setLoading(true);
      setError(false);
      try {
        setFilm(await apiFetch<Film>("/pick-of-day"));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    useEffect(() => {
      if (!initialFilm) load();
    }, []);

    if (loading) {
      return <Skeleton className="h-[60vh] w-full" />;
    }

    if (error || !film) {
      return (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-muted">Couldn't load the pick of the day.</p>
          <Button variant="secondary" onClick={load}>
            Retry
          </Button>
        </div>
      );
    }

    return (
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[60vh] w-full overflow-hidden"
      >
        {film.backdropUrl && (
          <Image
            src={film.backdropUrl}
            alt={film.title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <span className="mb-2 inline-block rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-white">
            {isToday(film.pickOfDayDate) ? "Today's Pick" : "Latest Pick"}
          </span>
          <h1 className="text-4xl font-bold text-white">{film.title}</h1>
          <p className="mt-1 text-muted">
            {film.year}
            {film.director ? ` · ${film.director}` : ""}
          </p>
          <div className="mt-3 flex gap-2">
            <ScoreBadge variant="imdb" score={film.imdbRating} />
            <ScoreBadge variant="rt" score={film.rtScore} />
          </div>
          <div className="mt-4">
            <FilmModal film={film}>
              <Button variant="primary">View Film</Button>
            </FilmModal>
          </div>
        </div>
      </motion.div>
    );
  }
  ```

---

## 11. Frontend — Film Detail

- [ ] Create `components/film/ScoreBadge.tsx`:

  ```tsx
  interface Props {
    variant: "imdb" | "rt";
    score: number | null;
  }

  export function ScoreBadge({ variant, score }: Props) {
    if (score === null) return null;
    if (variant === "imdb") {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-[#F5C518] px-2 py-0.5 text-xs font-bold text-black">
          IMDb {score.toFixed(1)}/10
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
        RT {score}%
      </span>
    );
  }
  ```

- [ ] Create `components/film/AwardsBadge.tsx`:

  ```tsx
  import type { Film } from "@cineroll/types";

  type Props = Pick<
    Film,
    "oscarNominations" | "oscarWins" | "ggNominations" | "ggWins"
  >;

  export function AwardsBadge({
    oscarNominations,
    oscarWins,
    ggNominations,
    ggWins,
  }: Props) {
    if (!oscarNominations && !ggNominations) return null;
    return (
      <div className="flex flex-wrap gap-3 text-sm">
        {oscarNominations > 0 && (
          <span className={oscarWins > 0 ? "text-accent" : "text-muted"}>
            {oscarWins > 0 ? "🏆" : "🥇"}{" "}
            {oscarWins > 0
              ? `${oscarWins} Oscar Win${oscarWins > 1 ? "s" : ""}`
              : `${oscarNominations} Oscar Nomination${oscarNominations > 1 ? "s" : ""}`}
          </span>
        )}
        {ggNominations > 0 && (
          <span className={ggWins > 0 ? "text-accent" : "text-muted"}>
            {ggWins > 0 ? "🏆" : "🥇"}{" "}
            {ggWins > 0
              ? `${ggWins} Golden Globe Win${ggWins > 1 ? "s" : ""}`
              : `${ggNominations} Golden Globe Nomination${ggNominations > 1 ? "s" : ""}`}
          </span>
        )}
      </div>
    );
  }
  ```

- [ ] Create `components/film/FilmCard.tsx`:

  ```tsx
  import Image from "next/image";
  import { Badge } from "@/components/ui/Badge";
  import { ScoreBadge } from "./ScoreBadge";
  import type { Film } from "@cineroll/types";

  interface Props {
    film: Film;
    onClick: () => void;
  }

  export function FilmCard({ film, onClick }: Props) {
    return (
      <button onClick={onClick} className="group cursor-pointer text-left">
        <div className="overflow-hidden rounded-lg">
          {film.posterUrl ? (
            <Image
              src={film.posterUrl}
              alt={film.title}
              width={342}
              height={513}
              className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-64 w-full items-center justify-center bg-surface-raised text-muted">
              No poster
            </div>
          )}
        </div>
        <div className="mt-2 space-y-1">
          <p className="truncate text-sm font-semibold text-text-base">
            {film.title}
          </p>
          <p className="text-xs text-muted">{film.year}</p>
          <div className="flex flex-wrap gap-1">
            {film.genres.slice(0, 2).map((g) => (
              <Badge key={g} label={g} />
            ))}
          </div>
          <div className="flex gap-1">
            <ScoreBadge variant="imdb" score={film.imdbRating} />
            <ScoreBadge variant="rt" score={film.rtScore} />
          </div>
        </div>
      </button>
    );
  }
  ```

- [ ] Create `components/film/FilmDetail.tsx`:

  ```tsx
  "use client";
  import Image from "next/image";
  import { useState, useEffect } from "react";
  import { Badge } from "@/components/ui/Badge";
  import { ScoreBadge } from "./ScoreBadge";
  import { AwardsBadge } from "./AwardsBadge";
  import { FilmModal } from "./FilmModal";
  import { FilmCard } from "./FilmCard";
  import { apiFetch } from "@/lib/api";
  import { formatRuntime } from "@/lib/utils";
  import type { Film, PaginatedFilms } from "@cineroll/types";

  export function FilmDetail({ film }: { film: Film }) {
    const [similar, setSimilar] = useState<Film[]>([]);
    const [trailerOpen, setTrailerOpen] = useState(false);
    const videoId = film.trailerUrl?.split("v=")[1] ?? null;

    useEffect(() => {
      if (!film.genres[0]) return;
      apiFetch<PaginatedFilms>(`/films?genre=${film.genres[0]}&limit=4`)
        .then((d) =>
          setSimilar(d.films.filter((f) => f.id !== film.id).slice(0, 3)),
        )
        .catch(() => {});
    }, [film.id]);

    return (
      <div>
        {film.backdropUrl && (
          <div className="relative h-64 w-full overflow-hidden rounded-t-xl">
            <Image
              src={film.backdropUrl}
              alt={film.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
          </div>
        )}
        <div className="space-y-4 p-6">
          <h2 className="text-3xl font-bold text-text-base">{film.title}</h2>
          <p className="text-muted">
            {film.year}
            {film.runtime ? ` · ${formatRuntime(film.runtime)}` : ""}
            {film.director ? ` · Dir. ${film.director}` : ""}
          </p>
          <div className="flex flex-wrap gap-1">
            {film.genres.map((g) => (
              <Badge key={g} label={g} />
            ))}
          </div>
          <div className="flex gap-2">
            <ScoreBadge variant="imdb" score={film.imdbRating} />
            <ScoreBadge variant="rt" score={film.rtScore} />
          </div>
          <AwardsBadge
            oscarNominations={film.oscarNominations}
            oscarWins={film.oscarWins}
            ggNominations={film.ggNominations}
            ggWins={film.ggWins}
          />
          {film.plot && (
            <p className="text-sm leading-relaxed text-muted">{film.plot}</p>
          )}
          {film.cast.length > 0 && (
            <p className="text-sm text-muted">
              <span className="font-medium text-text-base">Cast: </span>
              {film.cast.join(", ")}
            </p>
          )}

          {/* Trailer — show thumbnail facade; replace with iframe only on click */}
          {videoId && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
              {trailerOpen ? (
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              ) : (
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="group relative h-full w-full"
                  aria-label="Play trailer"
                >
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                    alt="Trailer thumbnail"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/20">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90">
                      <svg
                        className="h-7 w-7 translate-x-0.5 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </button>
              )}
            </div>
          )}

          {similar.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-text-base">
                More like this
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {similar.map((f) => (
                  <FilmModal key={f.id} film={f}>
                    <FilmCard film={f} onClick={() => {}} />
                  </FilmModal>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  ```

- [ ] Create `components/film/FilmModal.tsx`:

  ```tsx
  import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/Dialog";
  import { FilmDetail } from "./FilmDetail";
  import type { Film } from "@cineroll/types";

  interface Props {
    film: Film;
    children: React.ReactNode;
  }

  export function FilmModal({ film, children }: Props) {
    return (
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent title={film.title}>
          <FilmDetail film={film} />
        </DialogContent>
      </Dialog>
    );
  }
  ```

---

## 12. Frontend — Browse & Search

- [ ] Create `hooks/useFilters.ts`:

  ```ts
  "use client";
  import { useRouter, useSearchParams } from "next/navigation";
  import { useCallback } from "react";
  import type { FilterState } from "@cineroll/types";

  const DECADE_MIN_DEFAULT = 1920;
  const DECADE_MAX_DEFAULT = 2029;

  export function useFilters() {
    const params = useSearchParams();
    const router = useRouter();

    // All URL params are strings — coerce to correct types here, once
    const filters: FilterState = {
      search: params.get("search") ?? "",
      genre: params.get("genre") ?? "",
      decadeMin: Number(params.get("decade_min") ?? DECADE_MIN_DEFAULT),
      decadeMax: Number(params.get("decade_max") ?? DECADE_MAX_DEFAULT),
      page: Number(params.get("page") ?? 1),
    };

    const update = useCallback(
      (patch: Partial<Record<string, string>>) => {
        const next = new URLSearchParams(params.toString());
        Object.entries(patch).forEach(([k, v]) => {
          if (v) next.set(k, v);
          else next.delete(k);
        });
        if (!("page" in patch)) next.set("page", "1"); // reset page on filter change
        router.push(`/browse?${next.toString()}`);
      },
      [params, router],
    );

    return {
      filters,
      setSearch: (v: string) => update({ search: v }),
      setGenre: (v: string) => update({ genre: v }),
      setDecadeRange: (min: number, max: number) =>
        update({ decade_min: String(min), decade_max: String(max) }),
      setPage: (p: number) => update({ page: String(p) }),
      clearAll: () => router.push("/browse"),
    };
  }
  ```

- [ ] Create `components/filters/SearchInput.tsx`:

  ```tsx
  "use client";
  import { useState, useEffect } from "react";

  interface Props {
    value: string;
    onChange: (v: string) => void;
  }

  export function SearchInput({ value, onChange }: Props) {
    const [local, setLocal] = useState(value);

    useEffect(() => {
      const t = setTimeout(() => onChange(local), 300);
      return () => clearTimeout(t);
    }, [local]);

    return (
      <div className="relative">
        <input
          type="search"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder="Search films..."
          className="w-full rounded-lg border border-border bg-surface-raised px-4 py-2 pr-8 text-sm text-text-base placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {local && (
          <button
            onClick={() => {
              setLocal("");
              onChange("");
            }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-text-base"
          >
            ✕
          </button>
        )}
      </div>
    );
  }
  ```

- [ ] Create `components/filters/GenreSelect.tsx`:

  ```tsx
  "use client";
  import * as ToggleGroup from "@radix-ui/react-toggle-group";

  const GENRES = [
    "Action",
    "Comedy",
    "Drama",
    "Horror",
    "Thriller",
    "Romance",
    "Sci-Fi",
    "Animation",
    "Documentary",
    "Crime",
  ];

  interface Props {
    value: string;
    onChange: (v: string) => void;
  }

  export function GenreSelect({ value, onChange }: Props) {
    return (
      <ToggleGroup.Root
        type="single"
        value={value}
        onValueChange={(v) => onChange(v)}
        className="flex flex-wrap gap-2"
      >
        {GENRES.map((g) => (
          <ToggleGroup.Item
            key={g}
            value={g}
            className="rounded-full border border-border px-3 py-1 text-sm text-muted transition-colors hover:border-primary/50 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-white"
          >
            {g}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
    );
  }
  ```

- [ ] Create `components/filters/DecadeSlider.tsx`:

  ```tsx
  "use client";
  import * as Slider from "@radix-ui/react-slider";

  interface Props {
    min: number;
    max: number;
    onChange: (min: number, max: number) => void;
  }

  export function DecadeSlider({ min, max, onChange }: Props) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted">
          {min}s – {max}s
        </p>
        <Slider.Root
          min={1920}
          max={2029}
          step={10}
          value={[min, max]}
          onValueCommit={([a, b]) => onChange(a ?? min, b ?? max)}
          className="relative flex h-5 w-full touch-none select-none items-center"
        >
          <Slider.Track className="relative h-1 w-full rounded-full bg-border">
            <Slider.Range className="absolute h-full rounded-full bg-primary" />
          </Slider.Track>
          {[0, 1].map((i) => (
            <Slider.Thumb
              key={i}
              className="block h-5 w-5 rounded-full border-2 border-primary bg-surface shadow focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={i === 0 ? "Minimum decade" : "Maximum decade"}
            />
          ))}
        </Slider.Root>
      </div>
    );
  }
  ```

- [ ] Create `components/filters/FilterBar.tsx`:

  ```tsx
  "use client";
  import { useFilters } from "@/hooks/useFilters";
  import { SearchInput } from "./SearchInput";
  import { GenreSelect } from "./GenreSelect";
  import { DecadeSlider } from "./DecadeSlider";
  import { Button } from "@/components/ui/Button";

  interface Props {
    total: number;
    count: number;
  }

  export function FilterBar({ total, count }: Props) {
    const { filters, setSearch, setGenre, setDecadeRange, clearAll } =
      useFilters();
    const hasFilters = !!(filters.search || filters.genre);
    return (
      <div className="space-y-4">
        <SearchInput value={filters.search} onChange={setSearch} />
        <GenreSelect value={filters.genre} onChange={setGenre} />
        <DecadeSlider
          min={filters.decadeMin}
          max={filters.decadeMax}
          onChange={setDecadeRange}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">
            Showing {count} of {total} films
          </p>
          {hasFilters && (
            <Button variant="ghost" onClick={clearAll} className="text-xs">
              Clear filters
            </Button>
          )}
        </div>
      </div>
    );
  }
  ```

---

## 13. Frontend — Pages

- [ ] Create `app/page.tsx`:

  ```tsx
  import { PickOfTheDay } from "@/components/home/PickOfTheDay";
  import { RollSection } from "@/components/roll/RollSection";
  import type { Film } from "@cineroll/types";

  export const revalidate = 3600;

  async function getPickOfDay(): Promise<Film | null> {
    try {
      const res = await fetch(
        `${process.env["NEXT_PUBLIC_API_URL"]}/api/pick-of-day`,
        {
          next: { revalidate: 3600 },
        },
      );
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  export default async function HomePage() {
    const pickOfDay = await getPickOfDay();
    return (
      <div>
        <PickOfTheDay initialFilm={pickOfDay} />
        <section className="mx-auto max-w-xl px-4 py-16 text-center">
          <h2 className="mb-2 text-2xl font-bold text-text-base">
            Not feeling it?
          </h2>
          <p className="mb-8 text-muted">Roll the dice and let fate decide.</p>
          <RollSection />
        </section>
      </div>
    );
  }
  ```

- [ ] Create `app/browse/page.tsx`:

  ```tsx
  "use client";
  import { Suspense, useEffect, useState } from "react";
  import { FilterBar } from "@/components/filters/FilterBar";
  import { FilmCard } from "@/components/film/FilmCard";
  import { FilmModal } from "@/components/film/FilmModal";
  import { Skeleton } from "@/components/ui/Skeleton";
  import { Button } from "@/components/ui/Button";
  import { useFilters } from "@/hooks/useFilters";
  import { apiFetch } from "@/lib/api";
  import type { PaginatedFilms } from "@cineroll/types";

  function BrowseContent() {
    const { filters, setPage } = useFilters();
    const [data, setData] = useState<PaginatedFilms | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      setLoading(true);
      const q = new URLSearchParams({
        ...(filters.search && { search: filters.search }),
        ...(filters.genre && { genre: filters.genre }),
        decade_min: String(filters.decadeMin),
        decade_max: String(filters.decadeMax),
        page: String(filters.page),
      });
      apiFetch<PaginatedFilms>(`/films?${q}`)
        .then(setData)
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }, [
      filters.search,
      filters.genre,
      filters.decadeMin,
      filters.decadeMax,
      filters.page,
    ]);

    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <FilterBar total={data?.total ?? 0} count={data?.films.length ?? 0} />
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] w-full" />
              ))}
            </div>
          ) : !data || data.films.length === 0 ? (
            <div className="py-24 text-center text-muted">No films found.</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {data.films.map((film) => (
                  <FilmModal key={film.id} film={film}>
                    <FilmCard film={film} onClick={() => {}} />
                  </FilmModal>
                ))}
              </div>
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  variant="secondary"
                  disabled={filters.page <= 1}
                  onClick={() => setPage(filters.page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted">
                  Page {data.page} of {data.totalPages}
                </span>
                <Button
                  variant="secondary"
                  disabled={filters.page >= data.totalPages}
                  onClick={() => setPage(filters.page + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  export default function BrowsePage() {
    // Suspense required by Next.js for client components that use useSearchParams
    return (
      <Suspense>
        <BrowseContent />
      </Suspense>
    );
  }
  ```

- [ ] Create `app/film/[slug]/page.tsx`:

  ```tsx
  import { notFound } from "next/navigation";
  import { FilmDetail } from "@/components/film/FilmDetail";
  import type { Film } from "@cineroll/types";
  import type { Metadata } from "next";

  async function getFilm(slug: string): Promise<Film | null> {
    try {
      const res = await fetch(
        `${process.env["NEXT_PUBLIC_API_URL"]}/api/films/${slug}`,
      );
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed");
      return res.json();
    } catch {
      return null;
    }
  }

  export async function generateMetadata({
    params,
  }: {
    params: { slug: string };
  }): Promise<Metadata> {
    const film = await getFilm(params.slug);
    if (!film) return { title: "Film not found — CineRoll" };
    return {
      title: `${film.title} (${film.year}) — CineRoll`,
      description: film.plot ?? undefined,
    };
  }

  export async function generateStaticParams() {
    // Pre-render the first 100 slugs at build time; remaining are rendered on-demand (ISR)
    try {
      const res = await fetch(
        `${process.env["NEXT_PUBLIC_API_URL"]}/api/films?limit=100`,
      );
      if (!res.ok) return [];
      const data: { films: Film[] } = await res.json();
      return data.films.map((f) => ({ slug: f.slug }));
    } catch {
      return [];
    }
  }

  export default async function FilmPage({
    params,
  }: {
    params: { slug: string };
  }) {
    const film = await getFilm(params.slug);
    if (!film) notFound();
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <FilmDetail film={film} />
      </div>
    );
  }
  ```

- [ ] Create `app/not-found.tsx`:

  ```tsx
  import Link from "next/link";

  export default function NotFound() {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-6xl font-bold text-primary">404</p>
        <p className="text-xl text-text-base">Film not found.</p>
        <p className="text-muted">
          It might have been deleted or never existed.
        </p>
        <Link href="/" className="mt-4 text-sm text-primary hover:underline">
          Back to home
        </Link>
      </div>
    );
  }
  ```

- [ ] Create `app/error.tsx`:

  ```tsx
  "use client";

  export default function ErrorPage({
    error,
    reset,
  }: {
    error: Error;
    reset: () => void;
  }) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-xl text-text-base">Something went wrong.</p>
        <p className="text-sm text-muted">{error.message}</p>
        <button
          onClick={reset}
          className="rounded-lg border border-border px-4 py-2 text-sm text-text-base hover:bg-surface-raised"
        >
          Try again
        </button>
      </div>
    );
  }
  ```

- [ ] Run `npm run type-check` and `npm run build` for both workspaces — must both pass

---

## 14. Deployment

### Backend — Railway

- [ ] Push repo to GitHub: `git remote add origin https://github.com/HitaBeeDev/cineroll && git push -u origin main`
- [ ] Create new Railway service; connect GitHub repo; set root directory to `backend/`
- [ ] Set build command: `npm install && npm run build`
- [ ] Set start command: `node dist/index.js`
- [ ] Add env vars in Railway dashboard:
  ```
  DATABASE_URL=<neon production connection string>
  PORT=4000
  FRONTEND_URL=https://cineroll.vercel.app
  NODE_ENV=production
  ```
- [ ] Trigger deploy; confirm `GET https://your-backend.up.railway.app/health` → `{ ok: true }`
- [ ] Note the Railway URL for the next step

### Frontend — Vercel

- [ ] Connect GitHub repo to new Vercel project; root directory: `frontend/`; framework: Next.js
- [ ] Add env var in Vercel dashboard:
  ```
  NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
  ```
- [ ] Trigger deploy; confirm build passes and live URL loads
- [ ] Update `FRONTEND_URL` in Railway to the final Vercel production URL if it changed
- [ ] Smoke test end to end:
  - Home page loads; pick-of-day shows or falls back gracefully
  - Roll returns a film; Roll Again works; error toast appears on network failure
  - Browse search returns results; type a deliberate typo to confirm pg_trgm works
  - Genre and decade filters update the URL and results correctly
  - `/film/[slug]` page renders with correct title in browser tab
  - `FilmModal` opens, closes, and returns focus to trigger element
  - Dark mode toggles, persists on page reload, and no flash of wrong theme on load

---

## 15. Documentation

- [ ] Write `docs/decisions/001-monorepo.md`: npm workspaces; why not Turborepo (overkill for 2 packages at MVP scale)
- [ ] Write `docs/decisions/002-express-backend.md`: separate Express service vs Next.js API routes; tradeoff — extra service to host, benefit — independent deployability, clear separation, no Next.js cold starts on DB queries
- [ ] Write `docs/decisions/003-pgtrgm.md`: Context (typo-tolerant search, 2000+ films, no extra infra budget), Options (Fuse.js — client-side bundle, Algolia — cost, pg_trgm — DB-native), Decision, Tradeoffs, What I'd do differently (Typesense at 100k+ films); include the actual `$queryRaw` SQL
- [ ] Write `docs/case-study.md`: one problem, one solution, one tradeoff — portfolio-facing version of 003
- [ ] Write `README.md` at repo root:
  - Live URL at top
  - One GIF of the roll interaction
  - Tech stack table (Next.js, Express, Prisma, Neon, Tailwind, Framer Motion, Radix UI)
  - Architecture: `Browser → Next.js (Vercel) → Express (Railway) → Neon Postgres`
  - Local setup:
    ```bash
    git clone https://github.com/HitaBeeDev/cineroll
    cd cineroll
    npm install
    # copy backend/.env.example → backend/.env and fill in values
    # copy frontend/.env.example → frontend/.env.local and fill in values
    npm run db:migrate --workspace=backend
    npm run db:seed --workspace=backend
    npm run dev
    ```
  - Engineering highlight: pg_trgm search decision
  - Why a separate backend: one paragraph
