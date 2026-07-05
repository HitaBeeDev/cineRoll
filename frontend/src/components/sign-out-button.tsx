"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/" })}
      className="group/btn inline-flex items-center gap-2 rounded-lg border border-[#26262e] bg-transparent px-3.5 py-2 text-[13px] font-medium text-[#9a9aae] transition-colors duration-200 hover:border-[#e8453c]/50 hover:bg-[#e8453c]/[0.07] hover:text-[#f0736a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/50"
    >
      <LogOut className="h-4 w-4 transition-transform duration-200 group-hover/btn:-translate-x-0.5" aria-hidden />
      Sign out
    </button>
  );
}
