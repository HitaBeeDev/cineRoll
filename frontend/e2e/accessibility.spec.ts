import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { expect, test, type Page } from '@playwright/test';
import axe from 'axe-core';
import type { AxeResults } from 'axe-core';

const API_PORT = 4010;
const API_URL = `http://127.0.0.1:${API_PORT}`;
const APP_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

let apiServer: Server;

const awardRecord = {
  awardBody: 'oscar',
  awardYear: 2024,
  category: 'Best Picture',
  nominee: 'The Test Picture',
  won: true,
};

function film(overrides: Record<string, unknown> = {}) {
  return {
    id: 'film-test-picture',
    slug: 'the-test-picture',
    tmdbId: 123,
    imdbId: 'tt0000001',
    title: 'The Test Picture',
    originalTitle: null,
    releaseYear: 2024,
    year: 2024,
    runtime: 118,
    genres: ['Drama'],
    countries: ['United States'],
    contentType: 'movie',
    plot: 'A precise fixture film used to prove accessibility flows work from browse to detail.',
    director: 'Ava Example',
    cast: [],
    language: 'English',
    posterUrl: null,
    posterColor: '#884433',
    backdropUrl: null,
    trailerUrl: null,
    imdbRating: 8.4,
    averageRating: null,
    ratingCount: 0,
    rtScore: 92,
    imdbTopMovieRank: null,
    imdbTopTvRank: null,
    certificate: 'PG-13',
    tvType: null,
    tvStartYear: null,
    tvEndYear: null,
    oscarNominations: 3,
    oscarWins: 1,
    oscarCategories: [awardRecord],
    ggNominations: 0,
    ggWins: 0,
    ggCategories: [],
    cannesNominations: 0,
    cannesWins: 0,
    cannesCategories: [],
    berlinNominations: 0,
    berlinWins: 0,
    berlinCategories: [],
    watchProviders: null,
    isPickOfDay: false,
    pickOfDayDate: null,
    ...overrides,
  };
}

const browseFilms = [
  film(),
  film({
    id: 'film-filtered-oscar',
    slug: 'filtered-oscar',
    title: 'Filtered Oscar',
    releaseYear: 2022,
    year: 2022,
    oscarCategories: [{ ...awardRecord, awardYear: 2022, nominee: 'Filtered Oscar' }],
  }),
  film({
    id: 'film-third-fixture',
    slug: 'third-fixture',
    title: 'Third Fixture',
    releaseYear: 2021,
    year: 2021,
    oscarCategories: [{ ...awardRecord, awardYear: 2021, nominee: 'Third Fixture' }],
  }),
];

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(body));
}

function routeApi(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  const url = new URL(req.url ?? '/', API_URL);

  if (url.pathname === '/api/events') {
    sendJson(res, 201, { count: 1, dropped: 0 });
    return;
  }

  if (url.pathname === '/api/random/count') {
    sendJson(res, 200, { total: 42 });
    return;
  }

  if (url.pathname === '/api/random') {
    sendJson(res, 200, { film: film(), total: 42, personalized: false, exploration: false, lane: 'safe' });
    return;
  }

  if (url.pathname === '/api/films') {
    sendJson(res, 200, { films: browseFilms, total: 3, page: 1, totalPages: 1, pageSize: 12 });
    return;
  }

  if (url.pathname === '/api/films/the-test-picture') {
    sendJson(res, 200, film());
    return;
  }

  if (url.pathname === '/api/films/the-test-picture/similar') {
    sendJson(res, 200, { films: browseFilms.slice(1) });
    return;
  }

  if (url.pathname === '/api/pick-of-day') {
    sendJson(res, 200, film({ isPickOfDay: true, pickOfDayDate: '2026-07-06' }));
    return;
  }

  if (url.pathname === '/api/films/genres') {
    sendJson(res, 200, { genres: ['Drama', 'Comedy'] });
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
}

async function runAxe(page: Page) {
  await page.addScriptTag({ content: axe.source });
  const results = await page.evaluate(async () => window.axe.run(document)) as AxeResults;
  expect(formatViolations(results), `axe violations on ${new URL(page.url()).pathname}`).toEqual([]);
}

function formatViolations(results: AxeResults) {
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => ({
      target: node.target.join(' '),
      html: node.html,
      summary: node.failureSummary,
    })),
  }));
}

declare global {
  interface Window {
    axe: typeof axe;
  }
}

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  apiServer = createServer(routeApi);
  await new Promise<void>((resolve) => apiServer.listen(API_PORT, '127.0.0.1', resolve));
});

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    apiServer.close((error) => (error ? reject(error) : resolve()));
  });
});

test.beforeEach(async ({ context, page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('cineroll-theme', 'dark');
  });
  await context.addCookies([
    {
      name: 'cineroll_onboarded',
      value: 'true',
      url: APP_URL,
    },
  ]);
  await page.route('**/api/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: null, expires: new Date(Date.now() + 3_600_000).toISOString() }),
    });
  });
});

test('cookie consent banner has no automated axe violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Cookie consent' })).toBeVisible();
  await runAxe(page);
});

test('public pages have no automated axe violations', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('cineroll_cookie_consent', 'declined');
  });

  for (const path of ['/', '/browse', '/film/the-test-picture', '/privacy', '/terms']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await runAxe(page);
  }
});
