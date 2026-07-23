import type { CookieConsentChoice } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Dialog for reviewing essential vs. analytics storage and updating the choice. */
export function PreferencesDialog({
  open,
  onOpenChange,
  choice,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  choice: CookieConsentChoice | null;
  onSave: (choice: CookieConsentChoice) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#242438] bg-[#0b0b14]">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.35em] text-[#e8453c]">
            Cookie Preferences
          </DialogTitle>
          <DialogDescription className="text-[#9a9aac]">
            Manage optional analytics storage for this browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm leading-6 text-[#c9c9d8]">
          <div className="rounded-lg border border-[#252538] bg-[#11111b] p-4">
            <div className="font-medium text-[#f5f5f0]">Essential</div>
            <p className="mt-1 text-[#9a9aac]">
              Required for sign-in, onboarding, saved preferences, and basic app
              behavior. These cannot be turned off here.
            </p>
          </div>
          <div className="rounded-lg border border-[#252538] bg-[#11111b] p-4">
            <div className="font-medium text-[#f5f5f0]">Analytics</div>
            <p className="mt-1 text-[#9a9aac]">
              Optional product analytics helps measure film impressions,
              searches, rolls, and feature usage.
            </p>
            <p className="mt-3 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em] text-[#8a8aa0]">
              Current:{" "}
              <span className={choice === "granted" ? "text-[#e8453c]" : "text-[#c9c9d8]"}>
                {choice === "granted" ? "Allowed" : "Declined"}
              </span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            className="border-[#2a2a3e] bg-[#11111b] text-[#d7d7e4] hover:border-[#6a6a85] hover:bg-[#161622] hover:text-[#f5f5f0]"
            onClick={() => onSave("declined")}
          >
            Decline analytics
          </Button>
          <Button
            type="button"
            className="bg-[#e8453c] text-[#09090f] hover:bg-[#d5342b]"
            onClick={() => onSave("granted")}
          >
            Allow analytics
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
