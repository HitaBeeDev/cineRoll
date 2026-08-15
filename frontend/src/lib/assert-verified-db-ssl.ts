/**
 * Postgres hosts that are not reachable off this machine, where TLS is not the
 * thing standing between the query and an attacker.
 *
 * `[::1]` keeps its brackets: `URL.hostname` reports an IPv6 literal bracketed,
 * so the bare form would never match.
 */
const LOCAL_DB_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/**
 * Refuses a remote `DATABASE_URL` that does not ask for certificate
 * verification by name.
 *
 * `pg` currently treats `sslmode=require` (and `prefer`, and `verify-ca`) as an
 * alias for `verify-full`, so a `require` string is verified today by accident
 * of the driver's history, not because anything asked for it. `pg` v9 adopts
 * libpq semantics, where `require` means "encrypt, but accept any certificate
 * from anyone" — encrypted and MITM-able. That change would arrive as a
 * dependency bump with no error and no visible difference, which is the worst
 * shape a security regression can take. Naming `verify-full` explicitly makes
 * the guarantee survive the bump.
 *
 * The backend enforces the same rule in `backend/src/config.ts`; this app opens
 * its own pool for auth and lists, so the rule has to hold in both places.
 *
 * Local sockets are exempt: there is no certificate to verify. An absent URL is
 * left alone so a build with no database configured fails where it already did,
 * and an unparseable one is left to `pg` to reject with a better message.
 *
 * The URL is never included in the error — it carries the password.
 */
export function assertVerifiedDbSsl(url: string | undefined): void {
  if (!url) return;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return;
  }

  if (LOCAL_DB_HOSTS.has(parsed.hostname)) return;
  if (parsed.searchParams.get("sslmode") === "verify-full") return;

  throw new Error(
    "DATABASE_URL points at a remote database without sslmode=verify-full. " +
      "Append ?sslmode=verify-full (or &sslmode=verify-full) to the connection string. " +
      "Weaker modes are verified only by accident in the current pg release and stop " +
      "being verified in pg v9.",
  );
}
