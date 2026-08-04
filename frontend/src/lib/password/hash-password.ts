import bcrypt from "bcryptjs";

// 12 rounds: ~250ms/hash on commodity hardware — slow enough to blunt offline
// cracking, fast enough not to stall the sign-in request.
const BCRYPT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}
