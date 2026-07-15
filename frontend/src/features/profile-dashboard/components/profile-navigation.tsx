import { PROFILE_NAVIGATION_ITEMS } from "../profile-navigation-items";
import { ProfileNavigationCard } from "./profile-navigation-card";

export function ProfileNavigation() {
  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-3">
      {PROFILE_NAVIGATION_ITEMS.map((item) => (
        <ProfileNavigationCard key={item.href} item={item} />
      ))}
    </div>
  );
}
