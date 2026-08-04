import type { BanditLane, LaneBandit } from "@/lib/api";
import { sanitizeBetaArm } from "./sanitize-beta-arm";

export function validateLaneBandit(value: unknown): LaneBandit | null {
  if (!value || typeof value !== "object") return null;
  const storedArms = value as Partial<Record<BanditLane, unknown>>;
  const safe = sanitizeBetaArm(storedArms.safe);
  const gem = sanitizeBetaArm(storedArms.gem);
  const wild = sanitizeBetaArm(storedArms.wild);
  return safe && gem && wild ? { safe, gem, wild } : null;
}
