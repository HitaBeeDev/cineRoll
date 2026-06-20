"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SiteFeedbackForm } from "@/components/site-feedback-form";

export function SiteFeedbackDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.28em] text-[#5f5f78] transition-colors hover:text-[#e8453c] focus-visible:outline-none focus-visible:text-[#e8453c]">
        Feedback
      </DialogTrigger>
      <DialogContent className="border-[#242438] bg-[#0b0b14]">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.45em] text-[#e8453c]">
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
