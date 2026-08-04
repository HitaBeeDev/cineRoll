"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1.5 mb-6", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";
