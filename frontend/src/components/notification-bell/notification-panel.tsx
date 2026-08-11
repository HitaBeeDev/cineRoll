"use client";

import type { NotificationsController } from "@/components/notification-bell/use-notifications";
import { NotificationItem } from "@/components/notification-bell/notification-item";

/** Dropdown listing the site news feed. Anchored to the bell by the parent. */
export function NotificationPanel({
  controller,
}: {
  controller: NotificationsController;
}) {
  return (
    <div
      className="absolute right-0 top-11 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] shadow-xl"
      role="region"
      aria-label="Notifications"
    >
      <div className="border-b border-[#1e1e2a] px-4 py-3">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#444458]">
          What&apos;s new
        </p>
      </div>

      <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
        <PanelBody controller={controller} />
      </div>
    </div>
  );
}

function PanelBody({ controller }: { controller: NotificationsController }) {
  if (controller.loading) {
    return <PanelMessage>Loading…</PanelMessage>;
  }

  if (controller.failed) {
    return <PanelMessage>Couldn&apos;t load notifications.</PanelMessage>;
  }

  if (controller.items.length === 0) {
    return (
      <PanelMessage>
        Nothing yet. New films and award updates land here.
      </PanelMessage>
    );
  }

  return (
    <>
      {controller.items.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onNavigate={controller.close}
        />
      ))}
    </>
  );
}

function PanelMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 py-6 text-center text-[12px] leading-relaxed text-[#6b6880]">
      {children}
    </p>
  );
}
