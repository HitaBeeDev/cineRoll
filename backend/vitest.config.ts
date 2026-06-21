import { defineConfig, configDefaults } from 'vitest/config';

// Default backend suite — pure functions only, no DB, no server. Integration
// tests (`*.integration.test.ts`) are excluded here and run via their own config
// (`vitest.integration.config.ts` / `npm run test:integration`) against a test DB.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    exclude: [...configDefaults.exclude, '**/*.integration.test.ts'],
    // Pure-function suites are fast and isolated; no global setup / DB needed.
    globals: false,
  },
});
