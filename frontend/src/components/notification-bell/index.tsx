"use client";

import { useRef } from "react";
import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useNotifications } from "@/components/notification-bell/use-notifications";
import { NotificationPanel } from "@/components/notification-bell/notification-panel";

// Past this the count stops being a number and becomes "a lot", which is all a
// badge this size can say anyway.
const BADGE_MAX = 9;

/**
 * Header bell for site news. Renders nothing when signed out — the feed is
 * behind auth, so an empty bell there would be a control that can never do
 * anything.
 */
export function NotificationBell({
  focusRingClassName = "focus-visible:ring-[#e8453c]",
}: {
  focusRingClassName?: string;
}) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const panelRef = useRef<HTMLDivElement>(null);
  const notifications = useNotifications(isAuthenticated, panelRef);
  const { open, unreadCount } = notifications;

  if (!isAuthenticated) return null;

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={notifications.toggle}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-full",
          "border bg-[#101019] transition-colors duration-200",
          "hover:border-[#e8453c]/60 hover:text-[#F5F5F0]",
          "focus-visible:outline-none focus-visible:ring-2",
          open
            ? "border-[#e8453c]/60 text-[#F5F5F0]"
            : "border-[#22222e] text-[#888899]",
          focusRingClassName,
        )}
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1",
              "bg-[#e8453c] font-[family-name:var(--font-geist-mono)] text-[9px] font-bold text-[#0a0a14]",
            )}
            aria-hidden
          >
            {unreadCount > BADGE_MAX ? `${BADGE_MAX}+` : unreadCount}
          </span>
        )}
      </button>

      {open && <NotificationPanel controller={notifications} />}
    </div>
  );
}
