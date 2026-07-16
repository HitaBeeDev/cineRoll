"use client";

import { useEffect } from "react";
import { ONBOARDED_STORAGE_KEY } from "./constants";
import type { OnboardingState } from "./domain-types";
import { markOnboardedCookie } from "./mark-onboarded-cookie";

export function useLegacyOnboardingMigration(
  initialOnboarded: boolean,
  setState: (state: OnboardingState) => void,
): void {
  useEffect(() => {
    if (initialOnboarded) return;
    const timer = window.setTimeout(() => migrateLegacyFlag(setState), 0);
    return () => window.clearTimeout(timer);
  }, [initialOnboarded, setState]);
}

function migrateLegacyFlag(setState: (state: OnboardingState) => void): void {
  try {
    if (window.localStorage.getItem(ONBOARDED_STORAGE_KEY) !== "true") return;
    markOnboardedCookie();
    setState("done");
  } catch {
    // Keep the server-selected onboarding state.
  }
}
