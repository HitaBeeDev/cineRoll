export function getApiErrorCode(error: unknown): string | undefined {
  return error instanceof Error ? (error as Error & { code?: string }).code : undefined;
}
