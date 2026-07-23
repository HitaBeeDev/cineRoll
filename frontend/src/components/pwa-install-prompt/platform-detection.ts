/** Whether the app is running as an installed standalone PWA (not in a tab). */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari exposes this legacy flag when launched from the home screen.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Coarse-pointer phones/tablets only — never desktop. */
export function isTouchDevice(): boolean {
  return window.matchMedia("(pointer: coarse)").matches && window.innerWidth <= 1024;
}

/** iOS Safari specifically (not Chrome/FF/Edge/Opera on iOS, which can't install). */
export function isIosSafari(): boolean {
  const ua = window.navigator.userAgent;
  const iOS =
    /iphone|ipad|ipod/i.test(ua) ||
    // iPadOS 13+ masquerades as desktop Safari but reports touch points.
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
  const otherIosBrowser = /crios|fxios|edgios|opios/i.test(ua); // Chrome/FF/Edge/Opera on iOS
  return iOS && !otherIosBrowser;
}
