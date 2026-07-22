"use client";

import { useState } from "react";
import { ListPlus } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { SaveToListDialog } from "@/components/save-to-list-dialog/save-to-list-dialog";

/**
 * The trigger button + dialog wired together. Guests get a sign-in nudge toast
 * instead of the modal (lists need an account to persist).
 */
export function SaveToListButton({
  filmId,
  filmTitle,
  isAuthenticated,
  className,
  label = "Add to list",
  iconOnly = false,
}: {
  filmId: string;
  filmTitle: string;
  isAuthenticated: boolean;
  className?: string;
  label?: string;
  iconOnly?: boolean;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={iconOnly ? label : undefined}
        onClick={() => {
          if (!isAuthenticated) {
            toast({
              variant: "signin",
              title: "Sign in to save to lists",
              description: "Create a profile to build your own lists.",
              action: { label: "Sign in", href: "/auth/signin" },
              duration: 10000,
            });
            return;
          }
          setOpen(true);
        }}
        className={className}
      >
        <ListPlus className="h-4 w-4" aria-hidden />
        {!iconOnly && label}
      </button>
      {isAuthenticated && (
        <SaveToListDialog
          filmId={filmId}
          filmTitle={filmTitle}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
}
