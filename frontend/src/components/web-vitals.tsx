"use client";

import { useReportWebVitals } from "next/web-vitals";
import { reportWebVital } from "@/lib/analytics/web-vitals/report-web-vital";

/**
 * Field LCP / INP / CLS from real visitors into the events pipeline (read back
 * at /api/metrics/web-vitals). Its own tiny client component so the root
 * layout stays a server component. `reportWebVital` is a module-level function,
 * so the callback identity never changes and nothing is reported twice.
 */
export function WebVitals() {
  useReportWebVitals(reportWebVital);
  return null;
}
