import { MIN_PASSWORD_LENGTH } from "./min-password-length";

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
