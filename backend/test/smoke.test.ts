import { describe, it, expect } from 'vitest';

// Harness smoke test — confirms Vitest runs and resolves TS with no DB/server.
// The real pure-core suites (recommender, taste profile, scoring) land in 16b.
describe('vitest harness', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
