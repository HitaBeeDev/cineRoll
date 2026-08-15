/**
 * Postgres hosts that are not reachable off this machine, where TLS is not the
 * thing standing between the query and an attacker.
 *
 * `[::1]` keeps its brackets: `URL.hostname` reports an IPv6 literal bracketed,
 * so the bare form would never match.
 */
const LOCAL_DB_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/**
 * True when a `DATABASE_URL` is safe to connect with: either it never leaves the
 * machine, or it asks for certificate verification by name.
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
 * Local sockets are exempt: there is no certificate to verify, and demanding one
 * would only push developers toward disabling TLS checks in a way that outlives
 * the reason for it. An unparseable URL passes here and is left to `pg`, which
 * rejects it with a better message than this can give.
 */
export function requiresVerifiedSsl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return true;
  }

  if (LOCAL_DB_HOSTS.has(parsed.hostname)) return true;
  return parsed.searchParams.get("sslmode") === "verify-full";
}
