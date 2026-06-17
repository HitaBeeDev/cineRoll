// Temporary check for the Auth.js → backend JWT bridge.
// Mints a token the same way src/lib/apiWithAuth.ts does, then calls a
// protected backend route. Expect HTTP 200. Run: node scripts/test-bridge.mjs
import { readFileSync } from "node:fs";
import { encode } from "next-auth/jwt";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
);

const SALT = "authjs.session-token";
const API_URL = env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const token = await encode({
  token: { sub: "bridge-test-user", email: "bridge@test.local" },
  secret: env.NEXTAUTH_SECRET,
  salt: SALT,
  maxAge: 60 * 60,
});

async function call(label, headers) {
  const res = await fetch(`${API_URL}/api/user/watchlist`, { headers });
  console.log(`${label}: HTTP ${res.status} — ${await res.text()}`);
}

await call("no token (expect 401)", {});
await call("with token (expect 200)", { Authorization: `Bearer ${token}` });
