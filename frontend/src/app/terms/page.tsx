import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { LegalHero } from "@/features/legal/components/legal-hero";
import { TermsContent } from "@/features/terms-of-service/components/terms-content";
import { TERMS_UPDATED_AT } from "@/features/terms-of-service/config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "CineRoll terms of service covering acceptable use, accounts, user content ownership, moderation and removal rights, third-party film data, and disclaimers.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#08080d] text-[#f4f4f5]">
      <AppHeader />
      <LegalHero title="Terms of Service" updatedAt={TERMS_UPDATED_AT} />
      <TermsContent />
    </main>
  );
}
