import type { ProfileNavigationItem } from "./profile-navigation-item";

export const PROFILE_NAVIGATION_ITEMS: readonly ProfileNavigationItem[] = [
  {
    href: "/profile/watchlist",
    title: "Watchlist",
    blurb: "Films you’ve saved to watch later.",
    action: "Open watchlist",
  },
  {
    href: "/profile/history",
    title: "Watch History",
    blurb: "Everything you’ve marked watched.",
    action: "View history",
  },
  {
    href: "/profile/settings",
    title: "Settings",
    blurb: "Your account and preferences.",
    action: "Edit preferences",
  },
];
