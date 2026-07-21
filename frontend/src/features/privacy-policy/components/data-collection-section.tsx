import { PolicySection } from "@/features/legal/components/policy-section";

export function DataCollectionSection() {
  return (
    <PolicySection title="Data We Collect">
      <ul>
        <li>
          Account data: email address, display name, avatar, sign-in provider identifiers, session
          records, and email verification status.
        </li>
        <li>
          Film activity: watch history, liked or disliked watched films, watchlist entries, hidden
          or not-interested films, taste preferences, recommendations, and roll activity.
        </li>
        <li>
          Analytics events: impressions, clicks, searches, filter usage, recommendation
          interactions, pick-of-day interactions, anonymous browser IDs, session IDs, and related
          non-sensitive context.
        </li>
        <li>
          Feedback submissions: optional email address, message body, timestamp, and anti-abuse
          signals from the submission request.
        </li>
      </ul>
    </PolicySection>
  );
}
