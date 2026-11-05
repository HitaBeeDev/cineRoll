import { useCallback, useSyncExternalStore } from "react";
import { REGION_PARAM } from "./region-param";

// Fired after we rewrite the URL ourselves; popstate covers back/forward.
const CHANGE_EVENT = "cineroll:region-param";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function getSnapshot(): string | null {
  const value = new URLSearchParams(window.location.search).get(REGION_PARAM)?.toUpperCase();
  return value && /^[A-Z]{2}$/.test(value) ? value : null;
}

const getServerSnapshot = () => null;

/**
 * `?region=XX` from the address bar, read in the browser only. The server
 * never sees it — so every /film page stays one cached HTML document — and
 * no Suspense boundary is needed, unlike useSearchParams on a static route,
 * which would push the section out of the server HTML.
 *
 * Setting it rewrites the URL in place (no navigation, no server request), so
 * the chosen country is in the link when the page is shared.
 */
export function useRegionParam(): [string | null, (region: string) => void] {
  const region = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setRegion = useCallback((next: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set(REGION_PARAM, next);
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return [region, setRegion];
}
