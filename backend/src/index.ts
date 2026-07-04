// Must be first: initializes Sentry before the app and its dependencies load.
import "./instrument";
import { app } from "./app";
import { config } from "./config";

// On Vercel the app runs as a serverless function — Vercel imports this module
// and drives the exported Express app directly, so we must NOT call listen()
// there. Locally (and in any long-running host) we bind a port as usual.
if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`Backend running on http://localhost:${config.port}`);
  });
}

export default app;
