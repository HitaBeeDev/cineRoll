const promiseCache = new Map<string, Promise<unknown>>();

export function getCachedPromise<T>(
  key: string,
  loader: () => Promise<T>,
): Promise<T> {
  const cached = promiseCache.get(key) as Promise<T> | undefined;
  if (cached) return cached;

  const pending = loader().catch((error: unknown) => {
    promiseCache.delete(key);
    throw error;
  });
  promiseCache.set(key, pending);
  return pending;
}
