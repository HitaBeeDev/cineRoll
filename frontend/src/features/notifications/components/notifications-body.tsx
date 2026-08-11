import { MarkReadOnView } from "@/features/notifications/mark-read-on-view";
import { NotificationItem } from "@/features/notifications/components/notification-item";
import type { NotificationsResult } from "@/features/notifications/domain-types";

export async function NotificationsBody({
  resultPromise,
}: {
  resultPromise: Promise<NotificationsResult>;
}) {
  const result = await resultPromise;

  if (result.status === "error") {
    return (
      <BodyMessage>
        Couldn&apos;t load what&apos;s new. Try again in a moment.
      </BodyMessage>
    );
  }

  if (result.entries.length === 0) {
    return (
      <BodyMessage>
        Nothing yet. New films and award updates land here.
      </BodyMessage>
    );
  }

  return (
    <>
      <MarkReadOnView hasUnread={result.unreadCount > 0} />
      <div className="overflow-hidden rounded-2xl border border-[#1a1a24] bg-[#0b0b13]">
        {result.entries.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </>
  );
}

function BodyMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-[#1a1a24] bg-[#0b0b13] px-5 py-10 text-center text-[13px] leading-relaxed text-[#6b6880]">
      {children}
    </p>
  );
}
