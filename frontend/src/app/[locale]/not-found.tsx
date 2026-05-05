import Link from "next/link";
import { ArrowLeft, Film } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 items-center justify-center px-4">
      <Film className="h-14 w-14 text-zinc-700 mb-6" aria-hidden />
      <h1 className="text-3xl font-bold text-zinc-50 mb-2">Film not found</h1>
      <p className="text-zinc-400 text-center max-w-sm mb-8">
        We couldn&apos;t find that film. It may have been removed or the link is incorrect.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          Roll a random film
        </Link>
        <Link
          href="/browse"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:border-zinc-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to Browse
        </Link>
      </div>
    </div>
  );
}
