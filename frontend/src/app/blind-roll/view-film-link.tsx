import Link from "next/link";

type ViewFilmLinkProps = {
  slug: string;
};

export function ViewFilmLink({ slug }: ViewFilmLinkProps) {
  return (
    <Link
      href={`/film/${slug}`}
      className="flex h-14 items-center justify-center rounded-xl bg-[#e8453c] font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b]"
    >
      View Film
    </Link>
  );
}
