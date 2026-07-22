import { ANON_ID_KEY, SESSION_ID_KEY } from "./constants";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getOrCreateStoredId(storage: Storage, key: string): string {
  const existingId = storage.getItem(key);
  if (existingId) return existingId;

  const id = createId();
  storage.setItem(key, id);
  return id;
}

export function getClientIdentifiers(): {
  anonId: string;
  sessionId: string;
} {
  return {
    anonId: getOrCreateStoredId(window.localStorage, ANON_ID_KEY),
    sessionId: getOrCreateStoredId(window.sessionStorage, SESSION_ID_KEY),
  };
}
