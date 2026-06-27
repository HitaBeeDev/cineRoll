import bcrypt from "bcryptjs";

// 12 rounds: ~250ms/hash on commodity hardware — slow enough to blunt offline
// cracking, fast enough not to stall the sign-in request.
const BCRYPT_ROUNDS = 12;

export const MIN_PASSWORD_LENGTH = 8;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Returns a human-readable reason the password is unacceptable, or null when it
 * passes. Kept deliberately light (length + a letter + a number) — enough to
 * stop obviously weak passwords without nagging users into reuse.
 */
export function passwordIssue(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Include at least one letter and one number.";
  }
  return null;
}
