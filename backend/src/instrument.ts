import "dotenv/config";
import * as Sentry from "@sentry/node";

// Sentry must be initialized as early as possible — before the Express app and
// its dependencies are imported — so its auto-instrumentation can patch http,
// express, pg, etc. This module is therefore imported on the very first line of
// index.ts, ahead of "./app".
//
// With no SENTRY_DSN configured (e.g. local dev), init is skipped entirely and
// nothing is captured or sent.
const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    // Sample 10% of transactions for performance monitoring — enough signal
    // without a large ingest/cost footprint.
    tracesSampleRate: 0.1,
  });
}
