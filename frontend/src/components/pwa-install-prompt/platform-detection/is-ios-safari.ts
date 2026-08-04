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
