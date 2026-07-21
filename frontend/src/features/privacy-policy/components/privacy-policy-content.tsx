import { BrowserStorageSection } from "./browser-storage-section";
import { DataCollectionSection } from "./data-collection-section";
import { DataProcessorsSection } from "./data-processors-section";
import { DataRetentionSection } from "./data-retention-section";
import { DataUsageSection } from "./data-usage-section";
import { DeletionProcessSection } from "./deletion-process-section";
import { PrivacyContactSection } from "./privacy-contact-section";
import { PrivacyOverviewSection } from "./privacy-overview-section";

export function PrivacyPolicyContent() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-14 text-[#c8c8d8] lg:px-10">
      <PrivacyOverviewSection />
      <DataCollectionSection />
      <DataUsageSection />
      <BrowserStorageSection />
      <DataRetentionSection />
      <DataProcessorsSection />
      <DeletionProcessSection />
      <PrivacyContactSection />
    </div>
  );
}
