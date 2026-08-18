import Link from "next/link";
import { PolicySection } from "@/features/legal/components/policy-section";

export function PrivacyContactSection() {
  return (
    <PolicySection title="Contact">
      <p>
        You can download a copy of your data, or delete your account, from your{" "}
        <Link href="/profile/settings" className="underline underline-offset-4">
          settings page
        </Link>
        .
      </p>
      <p>
        For anything else, use the feedback form at the bottom of this page and include the email
        address connected to your account.
      </p>
    </PolicySection>
  );
}
