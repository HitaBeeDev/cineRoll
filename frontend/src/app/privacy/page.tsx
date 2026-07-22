import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { LegalHero } from "@/features/legal/components/legal-hero";
import { PrivacyPolicyContent } from "@/features/privacy-policy/components/privacy-policy-content";

const PRIVACY_POLICY_UPDATED_AT = "June 19, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "CineRoll privacy policy covering account data, film activity, comments, analytics, cookies and local storage, service providers, retention, and deletion.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#08080d] text-[#f4f4f5]">
      <AppHeader />
      <LegalHero title="Privacy Policy" updatedAt={PRIVACY_POLICY_UPDATED_AT} />
      <PrivacyPolicyContent />
    </main>
  );
}
