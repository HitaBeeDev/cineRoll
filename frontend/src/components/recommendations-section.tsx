import Image from "next/image";
import Link from "next/link";

export type Recommendation = {
  id: string;
  slug: string;
  title: string;
  year: number;
  posterUrl: string | null;
  genres: string[];
  director: string | null;
  imdbRating: number | null;
  rtScore: number | null;
  score: number;
  reason: string;
};

/**
 * Personalized, taste-based recommendations with their explanations. Distinct
 * from the global Pick of the Day (one editorial pick for everyone) — this is
 * a per-user set scored from the viewer's own signals, each card carrying the
 * reason it was chosen.
 */
export function RecommendationsSection({
  recommendations,
  coldStart,
}: {
  recommendations: Recommendation[];
  coldStart: boolean;
}) {
  return (
    <section className="mt-16">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#F5F5F0]">
        Recommended for you
      </h2>
      <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#888899]">
        {coldStart
          ? "Based on your starting genres — roll and rate to sharpen these"
          : "Picked from your taste · not the global Pick of the Day"}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="flex flex-col">
            <Link
              href={`/film/${rec.slug}`}
              className="group block overflow-hidden rounded-lg border border-[#1e1e2a] bg-[#0d0d1a] transition-colors hover:border-[#e8453c]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
            >
              <div className="relative aspect-[2/3] w-full bg-[#111120]">
                {rec.posterUrl ? (
                  <Image
                    src={rec.posterUrl}
                    alt={rec.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-3 text-center font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#444458]">
                    {rec.title}
                  </div>
                )}
              </div>
            </Link>

            <h3 className="mt-3 line-clamp-1 font-[family-name:var(--font-display)] text-sm font-bold text-[#F5F5F0]">
              {rec.title}
            </h3>
            <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.15em] text-[#666677]">
              {rec.year}
            </p>
            <p className="mt-1.5 line-clamp-2 font-[family-name:var(--font-geist-mono)] text-[11px] leading-relaxed text-[#888899]">
              {rec.reason}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
