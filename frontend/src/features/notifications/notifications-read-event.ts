/**
 * Fired after the What's new page marks the feed read, so the count in the
 * account menu drops without waiting for a reload. The menu stays mounted
 * across client-side navigation, so it cannot learn this by re-fetching.
 */
export const NOTIFICATIONS_READ_EVENT = "cineroll:notifications-read";
