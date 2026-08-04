"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { DialogOverlay } from "./dialog-overlay";
import { DialogPortal } from "./dialog-portal";

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    /**
     * The floating close button in the corner. Off for dialogs that lay out
     * their own — a scrolling dialog needs the close inside its sticky header,
     * where it stays put and keeps its alignment, rather than floating over
     * whatever content happens to be under it.
     */
    showCloseButton?: boolean;
  }
>(({ className, children, showCloseButton = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
        "w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6",
        "shadow-2xl shadow-black/60",
        "transition-all duration-200",
        "data-[state=open]:opacity-100 data-[state=open]:scale-100",
        "data-[state=closed]:opacity-0 data-[state=closed]:scale-95",
        "data-[state=open]:ease-out data-[state=closed]:ease-in",
        "focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close
          aria-label="Close dialog"
          className={cn(
            "absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full",
            "text-zinc-400 hover:text-white hover:bg-white/10",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
            "disabled:pointer-events-none"
          )}
        >
          <X className="h-[18px] w-[18px]" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";
