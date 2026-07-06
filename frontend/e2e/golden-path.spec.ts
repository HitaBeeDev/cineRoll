import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { test, expect } from '@playwright/test';

const API_PORT = 4010;
const API_URL = `http://127.0.0.1:${API_PORT}`;
const APP_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

let apiServer: Server;
let randomCalls = 0;

test.describe.configure({ mode: 'serial' });

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
    plot: 'A precise fixture film used to prove the golden path works from roll to detail.',
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

const rollFilms = [
  film(),
  film({
    id: 'film-spacebar-sonata',
    slug: 'spacebar-sonata',
    title: 'Spacebar Sonata',
    plot: 'A second fixture returned when the global spacebar shortcut rolls.',
    oscarCategories: [{ ...awardRecord, nominee: 'Spacebar Sonata' }],
  }),
];

const browseFilms = [
  film(),
  film({
    id: 'film-filtered-oscar',
    slug: 'filtered-oscar',
    title: 'Filtered Oscar',
    releaseYear: 2022,
    year: 2022,
    plot: 'A browse fixture filtered by the Oscar scope.',
    oscarCategories: [{ ...awardRecord, awardYear: 2022, nominee: 'Filtered Oscar' }],
  }),
];

const unfilteredBrowseFilms = [
  ...browseFilms,
  film({
    id: 'film-third-fixture',
    slug: 'third-fixture',
    title: 'Third Fixture',
    releaseYear: 2021,
    year: 2021,
    oscarCategories: [{ ...awardRecord, awardYear: 2021, nominee: 'Third Fixture' }],
  }),
];

const snobFilms = Array.from({ length: 20 }, (_, index) => ({
  ...film({
    id: `snob-${index + 1}`,
    slug: `snob-${index + 1}`,
    title: `Snob Fixture ${index + 1}`,
    releaseYear: 2000 + index,
    year: 2000 + index,
    imdbRating: 7 + (index % 3) * 0.3,
    oscarCategories: [{ ...awardRecord, nominee: `Snob Fixture ${index + 1}` }],
  }),
  decade: 2000 + Math.floor(index / 10) * 10,
  awardBodies: ['oscar'],
}));

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
    sendJson(res, 200, { total: url.searchParams.get('awardBody') === 'oscar' ? 2 : 42 });
    return;
  }

  if (url.pathname === '/api/random') {
    const selected = rollFilms[randomCalls % rollFilms.length];
    randomCalls += 1;
    sendJson(res, 200, {
      film: selected,
      total: 42,
      personalized: url.searchParams.get('personalized') === '1',
      exploration: false,
      lane: 'safe',
    });
    return;
  }

  if (url.pathname === '/api/films') {
    const filtered = url.searchParams.get('awardBody') === 'oscar';
    sendJson(res, 200, {
      films: filtered ? browseFilms : unfilteredBrowseFilms,
      total: filtered ? 2 : 3,
      page: 1,
      totalPages: 1,
      pageSize: 12,
    });
    return;
  }

  if (url.pathname === '/api/films/the-test-picture') {
    sendJson(res, 200, film());
    return;
  }

  if (url.pathname === '/api/films/the-test-picture/similar') {
    sendJson(res, 200, { films: [] });
    return;
  }

  if (url.pathname === '/api/films/missing-film') {
    sendJson(res, 404, { error: 'Film not found', code: 'FILM_NOT_FOUND' });
    return;
  }

  if (url.pathname === '/api/snob-test/films') {
    sendJson(res, 200, { films: snobFilms });
    return;
  }

  if (url.pathname === '/api/snob-test/score') {
    sendJson(res, 200, {
      score: 5,
      title: 'Movie Dilettante',
      seen: 1,
      total: 20,
      breakdown: {
        byDecade: { '2000s': { seen: 1, total: 10 }, '2010s': { seen: 0, total: 10 } },
        byAwardBody: {
          oscar: { seen: 1, total: 20 },
          goldenglobe: { seen: 0, total: 0 },
          cannes: { seen: 0, total: 0 },
        },
      },
    });
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
  randomCalls = 0;
  await page.addInitScript(() => {
    window.localStorage.setItem('cineroll-theme', 'dark');
    window.localStorage.removeItem('cineroll_personalized_roll');
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

test('home rolls by button and spacebar and exposes personalized roll for signed-in users', async ({ page }) => {
  await page.route('**/api/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
        expires: new Date(Date.now() + 3_600_000).toISOString(),
      }),
    });
  });

  await page.goto('/');

  const personalized = page.getByRole('switch', { name: /roll from my taste/i });
  await expect(personalized).toBeVisible();
  await personalized.click();
  await expect(personalized).toHaveAttribute('aria-checked', 'true');

  await page.getByRole('button', { name: /roll for a random film/i }).click();
  await expect(page.getByText('The Test Picture')).toBeVisible();

  await page.locator('body').click();
  await page.keyboard.press('Space');
  await expect(page.getByText('Spacebar Sonata')).toBeVisible();
});

test('browse shows the grid, count, Oscar filter state, and theme toggle', async ({ page }) => {
  await page.goto('/browse');

  const themeToggle = page.getByRole('button', { name: /switch to light theme/i });
  await expect(themeToggle).toBeVisible();
  await themeToggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('button', { name: /switch to dark theme/i })).toHaveAttribute('aria-pressed', 'true');

  await expect(page.getByRole('heading', { name: '3 films' })).toBeVisible();
  await expect(page.getByText('The Test Picture')).toBeVisible();

  await page.getByRole('button', { name: 'Oscar' }).click();

  await expect(page.getByRole('heading', { name: '2 films' })).toBeVisible();
  await expect(page.getByText('Filtered Oscar')).toBeVisible();
  await expect(page.getByRole('button', { name: /roll from 2 films/i })).toBeVisible();
});

test('film detail renders H1, awards, plot, and the not-found page', async ({ page }) => {
  await page.goto('/film/the-test-picture');

  await expect(page.getByRole('heading', { name: 'The Test Picture', level: 1 })).toBeVisible();
  await expect(page.getByText('Awards & Recognition')).toBeVisible();
  await expect(page.getByText('A precise fixture film used to prove the golden path works from roll to detail.')).toBeVisible();
  await page.getByText('Full award breakdown').click();
  await expect(page.getByText('Academy Awards')).toBeVisible();

  await page.goto('/film/missing-film');

  await expect(page.getByRole('heading', { name: 'Film not found' })).toBeVisible();
});

test('Snob Test supports selecting films and scoring the ballot', async ({ page }) => {
  await page.goto('/snob-test');

  await expect(page.getByRole('heading', { name: /The Snob Test/i })).toBeVisible();
  await page.getByRole('button', { name: /Mark Snob Fixture 1 as seen/i }).click();
  await expect(page.getByRole('complementary').getByText('1/20', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /See My Score/i }).click();

  await expect(page.getByRole('heading', { name: 'Movie Dilettante', level: 2 })).toBeVisible();
  await expect(page.locator('span').filter({ hasText: /^5%$/ }).first()).toBeVisible();
});

test('sign-in page renders and logged-out profile visits redirect to sign-in', async ({ page }) => {
  await page.goto('/auth/signin');

  await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
  await expect(page.getByLabel('Email address')).toBeVisible();

  await page.goto('/profile');

  await expect(page).toHaveURL(/\/auth\/signin/);
});
