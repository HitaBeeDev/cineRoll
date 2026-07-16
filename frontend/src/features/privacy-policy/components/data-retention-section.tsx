import { PolicySection } from "@/features/legal/components/policy-section";

export function DataRetentionSection() {
  return (
    <PolicySection title="Retention">
      <ul>
        <li>
          Account, watch history, watchlist, ratings, comments, and taste profile data are kept while
          your account remains active.
        </li>
        <li>
          Analytics events are retained for product analysis and may be aggregated for longer-term
          trend reporting.
        </li>
        <li>
          Feedback submissions are retained while they are useful for product planning, support,
          and abuse prevention.
        </li>
        <li>
          If you request account deletion, we delete or anonymize personal account data unless
          retention is required for security, legal, or abuse-prevention reasons.
        </li>
      </ul>
    </PolicySection>
  );
}
