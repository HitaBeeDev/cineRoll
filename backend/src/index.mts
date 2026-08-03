// Must be first: initializes Sentry before the app and its dependencies load.
import "./instrument.js";
import { app } from "./httpApp.js";

// Vercel's TypeScript Express detector expects an actual ESM default export.
// This .mts boundary keeps that contract explicit even though the rest of the
// backend is compiled as CommonJS.
//
// Nothing here listens: on Vercel the platform serves this default export, and
// local dev boots through src/localDev.ts instead. That split is deliberate —
// `tsx` transpiles without bundling, and Node cannot resolve a named import
// from an esbuild-produced CommonJS module, so this file is unloadable under
// `tsx watch` no matter how the import is written.
export default app;
