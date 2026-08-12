import path from 'node:path';
import { defineConfig, configDefaults } from 'vitest/config';

// Default backend suite — pure functions only, no DB, no server. Integration
// tests (`*.integration.test.ts`) are excluded here and run via their own config
// (`vitest.integration.config.ts` / `npm run test:integration`) against a test DB.
export default defineConfig({
  // A few suites here cover frontend logic that has no runtime of its own — the
  // analytics queue, the roll session's grading. Those modules resolve their own
  // imports through the frontend's `@/` alias, so this suite has to speak it too.
  // The trailing slash matters: a bare "@" would also capture "@prisma/client".
  resolve: {
    alias: { '@/': `${path.resolve(__dirname, '../frontend/src')}/` },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    exclude: [...configDefaults.exclude, '**/*.integration.test.ts'],
    // Pure-function suites are fast and isolated; no global setup / DB needed.
    globals: false,
  },
});
