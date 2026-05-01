"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

const variants: Record<Variant, string> = {
  primary: cn(
    "bg-amber-400 text-zinc-950 font-semibold",
    "hover:bg-amber-300",
    "active:bg-amber-500 active:scale-[0.97]",
    "disabled:bg-zinc-800 disabled:text-zinc-600"
  ),
  secondary: cn(
    "border border-zinc-700 text-zinc-200 bg-transparent",
    "hover:border-zinc-500 hover:bg-zinc-800/60",
    "active:bg-zinc-700 active:scale-[0.97]",
    "disabled:border-zinc-800 disabled:text-zinc-700"
  ),
  ghost: cn(
    "text-zinc-400 bg-transparent",
    "hover:text-zinc-100 hover:bg-zinc-800/60",
    "active:bg-zinc-700 active:scale-[0.97]",
    "disabled:text-zinc-700"
  ),
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-md gap-1.5 tracking-wide uppercase",
  md: "h-10 px-5 text-sm rounded-lg gap-2",
  lg: "h-12 px-7 text-base rounded-lg gap-2.5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      asChild = false,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-150 cursor-pointer select-none whitespace-nowrap",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
          "disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
