import { defineConfig } from 'vitest/config';

// Integration suite — DB-backed (`*.integration.test.ts`). Opt-in: requires
// RUN_DB_TESTS=1 and a DATABASE_URL pointed at a dedicated, empty test database.
// Runs serially (single fork) so fixture seed/cleanup never races across files.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.integration.test.ts', 'test/**/*.integration.test.ts'],
    globals: false,
    // Run integration files serially so fixture seed/cleanup never races (Vitest 4
    // moved the old `poolOptions.forks.singleFork` to this top-level flag).
    fileParallelism: false,
  },
});
