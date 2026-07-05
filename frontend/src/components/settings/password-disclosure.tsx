"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PasswordForm } from "@/components/settings/password-form";

/**
 * Changing a password is rare, so the form stays collapsed behind a quiet
 * toggle — keeping the loud red submit button (and three inputs) out of sight
 * until the user actually chooses to edit. Expands inline with a soft height
 * transition (grid-rows 0fr → 1fr, no measuring needed).
 */
export function PasswordDisclosure({ hasPassword }: { hasPassword: boolean }) {
  const [open, setOpen] = useState(false);
  const label = hasPassword ? "Change password" : "Set a password";

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-lg border border-[#26262e] bg-transparent px-3.5 py-2 text-[13px] font-medium text-[#c4c4d2] transition-colors duration-200 hover:border-[#3a3a4a] hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/50"
      >
        {open ? "Cancel" : label}
        <ChevronDown
          className={`h-4 w-4 text-[#7f7f92] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          {/* Mount only when opening keeps autofocus/autocomplete sane, but we
              keep it mounted while collapsing so the transition can play. */}
          <PasswordForm hasPassword={hasPassword} />
        </div>
      </div>
    </div>
  );
}
