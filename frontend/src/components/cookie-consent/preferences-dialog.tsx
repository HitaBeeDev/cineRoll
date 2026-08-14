import type { CookieConsentChoice } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog/dialog";
import { DialogContent } from "@/components/ui/dialog/dialog-content";
import { DialogDescription } from "@/components/ui/dialog/dialog-description";
import { DialogFooter } from "@/components/ui/dialog/dialog-footer";
import { DialogHeader } from "@/components/ui/dialog/dialog-header";
import { DialogTitle } from "@/components/ui/dialog/dialog-title";

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
          <DialogTitle className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.35em] text-accent">
            Cookie Preferences
          </DialogTitle>
          <DialogDescription className="text-[#9a9aac]">
            Manage optional analytics storage for this browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm leading-6 text-[#c9c9d8]">
          <div className="rounded-lg border border-[#252538] bg-ink-800 p-4">
            <div className="font-medium text-fg-hi">Essential</div>
            <p className="mt-1 text-[#9a9aac]">
              Required for sign-in, onboarding, saved preferences, and basic app
              behavior. These cannot be turned off here.
            </p>
          </div>
          <div className="rounded-lg border border-[#252538] bg-ink-800 p-4">
            <div className="font-medium text-fg-hi">Analytics</div>
            <p className="mt-1 text-[#9a9aac]">
              Optional product analytics helps measure film impressions,
              searches, rolls, and feature usage.
            </p>
            <p className="mt-3 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em] text-[#8a8aa0]">
              Current:{" "}
              <span className={choice === "granted" ? "text-accent" : "text-[#c9c9d8]"}>
                {choice === "granted" ? "Allowed" : "Declined"}
              </span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            className="border-edge-strong bg-ink-800 text-[#d7d7e4] hover:border-edge-hover hover:bg-[#161622] hover:text-fg-hi"
            onClick={() => onSave("declined")}
          >
            Decline analytics
          </Button>
          <Button
            type="button"
            className="bg-accent text-ink-900 hover:bg-[#d5342b]"
            onClick={() => onSave("granted")}
          >
            Allow analytics
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
