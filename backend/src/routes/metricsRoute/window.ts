const DAY_MS = 24 * 60 * 60 * 1000;

export type MetricsWindow = {
  days: number | null;
  since: Date | null;
};

export function metricsWindow(days: number | undefined): MetricsWindow {
  return {
    days: days ?? null,
    since: days != null ? new Date(Date.now() - days * DAY_MS) : null,
  };
}

export function serializeWindow(window: MetricsWindow) {
  return {
    days: window.days,
    since: window.since?.toISOString() ?? null,
  };
}
