"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
};

/** Password field with a show/hide toggle. Shared by the sign-in form and the
 *  reset-password form so the reveal behaviour stays identical. */
export function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={cn(
          "h-12 w-full rounded-xl border border-[#2b2b3d] bg-[#10101d] pl-4 pr-12",
          "text-sm text-[#F5F5F0] placeholder:text-[#777789]",
          "transition-colors focus:border-[#e8453c]/70 focus:outline-none focus:ring-2 focus:ring-[#e8453c]/15",
          // Repaint Chrome's pale autofill background to match the dark field.
          "autofill:[-webkit-box-shadow:0_0_0_1000px_#10101d_inset] autofill:[-webkit-text-fill-color:#F5F5F0] autofill:[caret-color:#F5F5F0]",
        )}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        // Keep it out of the tab order and screen-reader-labelled; it's a
        // convenience control, not a form field.
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className={cn(
          "absolute right-1 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-lg",
          "text-[#8f8fa0] transition-colors hover:text-[#F5F5F0]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40",
        )}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
