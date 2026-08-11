"use client";

import Link from "next/link";
import { Award, Film, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { NotificationFeed } from "@/lib/api";
import { formatNotificationTime } from "@/components/notification-bell/format-notification-time";

const KIND_ICONS = {
  films_added: Film,
  awards_updated: Award,
} as const;

/** One row in the notification panel. Wrapped in a link only when it leads somewhere. */
export function NotificationItem({
  notification,
  onNavigate,
}: {
  notification: NotificationFeed["notifications"][number];
  onNavigate: () => void;
}) {
  const Icon =
    KIND_ICONS[notification.kind as keyof typeof KIND_ICONS] ?? Megaphone;

  const body = (
    <div className="flex gap-3">
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          notification.unread ? "text-[#e8453c]" : "text-[#555568]",
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[13px] leading-snug",
            notification.unread ? "text-[#F5F5F0]" : "text-[#b4b0c2]",
          )}
        >
          {notification.title}
        </p>
        {notification.body !== null && (
          <p className="mt-1 text-[12px] leading-relaxed text-[#7c7890]">
            {notification.body}
          </p>
        )}
        <p className="mt-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.12em] text-[#4d4d61]">
          {formatNotificationTime(notification.createdAt)}
        </p>
      </div>
    </div>
  );

  const className = cn(
    "block border-b border-[#16161f] px-4 py-3 last:border-b-0",
    notification.unread && "bg-[#e8453c]/[0.04]",
  );

  if (notification.href === null) {
    return <div className={className}>{body}</div>;
  }

  return (
    <Link
      href={notification.href}
      onClick={onNavigate}
      className={cn(className, "transition-colors hover:bg-[#141420]")}
    >
      {body}
    </Link>
  );
}
