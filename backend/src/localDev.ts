// Local dev entrypoint. Kept CommonJS (like the rest of src) so `tsx watch`
// never crosses the ESM->CJS boundary that src/index.mts sits on; that boundary
// only links when the loader bundles both sides, which tsx does not do.
// Production still boots from src/index.mts — see the note there.
import "./instrument";
import { app } from "./httpApp";
import { config } from "./config";

app.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port}`);
});
