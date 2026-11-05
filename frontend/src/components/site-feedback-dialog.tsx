"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog/dialog";
import { DialogContent } from "@/components/ui/dialog/dialog-content";
import { DialogDescription } from "@/components/ui/dialog/dialog-description";
import { DialogHeader } from "@/components/ui/dialog/dialog-header";
import { DialogTitle } from "@/components/ui/dialog/dialog-title";
import { DialogTrigger } from "@/components/ui/dialog/dialog-trigger";
import { SiteFeedbackForm } from "@/components/site-feedback-form";

const FOOTER_TRIGGER_CLASS =
  "rounded-sm font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-fg-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:text-accent focus-visible:ring-2 focus-visible:ring-accent/50";

/** The feedback form in a dialog. Defaults to the footer's "Feedback" link; pages can pass their own trigger look. */
export function SiteFeedbackDialog({
  triggerLabel = "Feedback",
  triggerClassName = FOOTER_TRIGGER_CLASS,
}: {
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={triggerClassName}>{triggerLabel}</DialogTrigger>
      <DialogContent className="border-[#242438] bg-[#0b0b14]">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.45em] text-accent">
            Share Your Thoughts
          </DialogTitle>
          <DialogDescription className="text-[#8f8fa6]">
            Tell us what feels missing, confusing, or worth building next.
          </DialogDescription>
        </DialogHeader>
        <SiteFeedbackForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
