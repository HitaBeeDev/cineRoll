import { defineConfig } from 'vitest/config';

// Backend unit tests run against pure functions only — no DB, no server.
// Tests live next to the code they cover (`src/**/*.test.ts`) or under `test/`.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    // Pure-function suites are fast and isolated; no global setup / DB needed.
    globals: false,
  },
});
