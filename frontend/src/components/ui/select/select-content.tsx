"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils/cn";
import { SelectScrollDownButton } from "./select-scroll-down-button";
import { SelectScrollUpButton } from "./select-scroll-up-button";

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden",
        "max-h-[min(var(--radix-select-content-available-height),28rem)]",
        "rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl shadow-black/40",
        "transition-opacity duration-150",
        "data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        data-lenis-prevent
        className={cn(
          "max-h-[min(var(--radix-select-content-available-height),28rem)] overflow-y-auto p-1",
          position === "popper" &&
            "w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;
