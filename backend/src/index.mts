// Must be first: initializes Sentry before the app and its dependencies load.
import "./instrument.js";
import { app } from "./httpApp.js";
import { config } from "./config.js";

// Vercel's TypeScript Express detector expects an actual ESM default export.
// This .mts boundary keeps that contract explicit even though the rest of the
// backend is compiled as CommonJS.
if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`Backend running on http://localhost:${config.port}`);
  });
}

export default app;
