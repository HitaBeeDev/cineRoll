import { PolicySection } from "@/features/legal/components/policy-section";

export function DataUsageSection() {
  return (
    <PolicySection title="Why We Use Data">
      <ul>
        <li>To create and secure your account and sign-in sessions.</li>
        <li>To save watch history, watchlists, ratings, and comments.</li>
        <li>
          To personalize recommendations and taste-weighted rolls from your saved film activity.
        </li>
        <li>
          To understand whether CineRoll features work well and where the product needs improvement.
        </li>
        <li>To respond to feedback and prevent spam or abuse.</li>
      </ul>
    </PolicySection>
  );
}
