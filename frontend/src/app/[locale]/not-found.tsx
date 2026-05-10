import Link from "next/link";
import { ArrowLeft, Film } from "lucide-react";
import { AppHeader } from "@/components/app-header";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <AppHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <Film className="mb-6 h-14 w-14 text-zinc-700" aria-hidden />
        <h1 className="mb-2 text-3xl font-bold text-zinc-50">Film not found</h1>
        <p className="mb-8 max-w-sm text-center text-zinc-400">
          We couldn&apos;t find that film. It may have been removed or the link is incorrect.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8453c] px-5 py-2.5 text-sm font-semibold text-[#F5F5F0] transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
          >
            Roll a random film
          </Link>
          <Link
            href="/browse"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#222232] px-5 py-2.5 text-sm font-medium text-[#888899] transition-colors hover:border-[#e8453c]/40 hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Browse
          </Link>
        </div>
      </main>
    </div>
  );
}
