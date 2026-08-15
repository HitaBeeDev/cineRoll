import { describe, expect, it } from "vitest";

import { requiresVerifiedSsl } from "../src/lib/verifiedDbSsl";

const NEON = "postgresql://user:pass@ep-example.us-east-1.aws.neon.tech/cineroll";

describe("requiresVerifiedSsl", () => {
  it("accepts a remote host that names verify-full", () => {
    expect(requiresVerifiedSsl(`${NEON}?sslmode=verify-full`)).toBe(true);
  });

  it("accepts verify-full when it is not the first parameter", () => {
    expect(requiresVerifiedSsl(`${NEON}?pgbouncer=true&sslmode=verify-full`)).toBe(true);
  });

  // The whole point of the check: these are the modes pg verifies today by
  // accident and stops verifying in v9. They must not pass now, while the
  // upgrade is still ours to choose.
  it.each(["require", "prefer", "verify-ca", "allow", "disable"])(
    "rejects a remote host on sslmode=%s",
    (mode) => {
      expect(requiresVerifiedSsl(`${NEON}?sslmode=${mode}`)).toBe(false);
    },
  );

  it("rejects a remote host with no sslmode at all", () => {
    expect(requiresVerifiedSsl(NEON)).toBe(false);
  });

  it.each(["localhost", "127.0.0.1", "[::1]"])(
    "exempts %s, where there is no certificate to verify",
    (host) => {
      expect(requiresVerifiedSsl(`postgresql://aliet@${host}:5432/cineroll`)).toBe(true);
    },
  );

  it("leaves an unparseable url to pg rather than failing boot on it", () => {
    expect(requiresVerifiedSsl("not-a-url")).toBe(true);
  });
});
