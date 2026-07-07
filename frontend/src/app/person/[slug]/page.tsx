import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { blurDataUrl, tmdbImageUrl } from "@/lib/images";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://cineroll.app");

// ── Types ────────────────────────────────────────────────────────────────────

type AwardRow = {
  filmSlug: string;
  filmTitle: string;
  releaseYear: number;
  posterUrl: string | null;
  category: string;
  awardYear: number;
  won: boolean;
};

type FilmRow = {
  id: string;
  slug: string;
  title: string;
  releaseYear: number;
  posterUrl: string | null;
  imdbRating: number | null;
  role: "director" | "nominee";
};

type PersonData = {
  name: string;
  slug: string;
  photoUrl: string | null;
  bio: string | null;
  totalNominations: number;
  totalWins: number;
  oscarRecords: AwardRow[];
  ggRecords: AwardRow[];
  cannesRecords: AwardRow[];
  films: FilmRow[];
};

// ── Data fetching ─────────────────────────────────────────────────────────────

async function fetchPerson(slug: string): Promise<PersonData | null> {
  try {
    const res = await fetch(`${API_URL}/api/persons/${encodeURIComponent(slug)}`, {
      next: { revalidate: 86400 },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return res.json() as Promise<PersonData>;
  } catch {
    return null;
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const person = await fetchPerson(slug);
  if (!person) return { title: "Person Not Found" };

  const winLine =
    person.totalWins > 0
      ? `${person.totalWins} wins from ${person.totalNominations} nominations across the Oscars, Golden Globes, and Cannes.`
      : `${person.totalNominations} nominations across the Oscars, Golden Globes, and Cannes.`;

  const description =
    person.bio
      ? `${person.bio.slice(0, 120).trim()}… ${winLine}`
      : winLine;

  const pageUrl = new URL(`/person/${slug}`, SITE_URL).toString();

  return {
    title: `${person.name} — Award History | CineRoll`,
    description: description.slice(0, 155),
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${person.name} — Award History | CineRoll`,
      description: description.slice(0, 155),
      url: pageUrl,
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${person.name} — Award History | CineRoll`,
      description: description.slice(0, 155),
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PersonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const person = await fetchPerson(slug);
  if (!person) notFound();

  const oscarWins = person.oscarRecords.filter((r) => r.won).length;
  const ggWins = person.ggRecords.filter((r) => r.won).length;
  const cannesWins = person.cannesRecords.filter((r) => r.won).length;

  const awardBodies = [
    person.oscarRecords.length > 0
      ? { label: "Academy Awards", code: "OSCARS", records: person.oscarRecords, wins: oscarWins }
      : null,
    person.ggRecords.length > 0
      ? { label: "Golden Globes", code: "GG", records: person.ggRecords, wins: ggWins }
      : null,
    person.cannesRecords.length > 0
      ? { label: "Cannes Film Festival", code: "CANNES", records: person.cannesRecords, wins: cannesWins }
      : null,
  ].filter(Boolean) as { label: string; code: string; records: AwardRow[]; wins: number }[];

  const initials = person.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();

  const hue = [...person.name].reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0);
  const avatarHue = Math.abs(hue) % 360;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    url: new URL(`/person/${slug}`, SITE_URL).toString(),
    ...(person.photoUrl ? { image: person.photoUrl } : {}),
    ...(person.bio ? { description: person.bio } : {}),
  };

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f4f4f5]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <AppHeader />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[#111118] bg-[#07070b]">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 80% at 80% 50%, hsl(${avatarHue},22%,14%) 0%, transparent 65%),
              radial-gradient(ellipse 40% 60% at 0% 100%, #e8453c0a, transparent 60%)
            `,
          }}
        />
        {/* Film grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "256px 256px",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24 lg:px-10">
          <div className="flex flex-col items-start gap-10 sm:flex-row sm:items-center">
            {/* Photo / Avatar */}
            <div className="shrink-0">
              {person.photoUrl ? (
                <div
                  className="relative h-32 w-32 overflow-hidden rounded-full sm:h-44 sm:w-44"
                  style={{
                    boxShadow: `0 0 0 1px rgba(255,255,255,0.09), 0 24px 60px rgba(0,0,0,0.7), 0 0 40px hsl(${avatarHue},25%,20%)`,
                  }}
                >
                  <Image
                    src={person.photoUrl}
                    alt={person.name}
                    fill
                    sizes="(max-width: 640px) 128px, 176px"
                    className="object-cover object-top"
                    priority
                  />
                </div>
              ) : (
                <div
                  className="flex h-32 w-32 items-center justify-center rounded-full border border-white/8 sm:h-44 sm:w-44"
                  style={{
                    background: `radial-gradient(circle at 40% 35%, hsl(${avatarHue},12%,16%), hsl(${avatarHue},6%,9%))`,
                    boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 24px 60px rgba(0,0,0,0.7)`,
                  }}
                >
                  <span
                    className="font-[family-name:var(--font-display)] text-4xl font-bold sm:text-5xl"
                    style={{ color: `hsl(${avatarHue},35%,65%)` }}
                  >
                    {initials}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              {/* Label */}
              <p className="mb-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.5em] text-[#e8453c]">
                ◆ Award Profile
              </p>

              {/* Name */}
              <h1
                className="font-[family-name:var(--font-display)] font-bold leading-[0.9] tracking-tight text-[#f8f8f4]"
                style={{ fontSize: "clamp(2.4rem,6vw,5rem)" }}
              >
                {person.name}
              </h1>

              {/* Stats */}
              <div className="mt-8 flex flex-wrap items-baseline gap-x-10 gap-y-4">
                <Stat
                  value={person.totalNominations}
                  label="Nominations"
                  accent={false}
                />
                <Stat
                  value={person.totalWins}
                  label="Wins"
                  accent={person.totalWins > 0}
                />
                <Stat
                  value={person.films.length}
                  label="Films"
                  accent={false}
                />
              </div>

              {/* Bio */}
              {person.bio && (
                <p className="mt-7 max-w-[68ch] text-[0.9rem] leading-[1.9] text-[#8888a0]">
                  {person.bio.length > 300
                    ? `${person.bio.slice(0, 300).trim()}…`
                    : person.bio}
                </p>
              )}

              {/* Browse CTA */}
              <div className="mt-8">
                <Link
                  href={`/browse?person=${encodeURIComponent(person.name)}`}
                  className="inline-flex items-center gap-2 border border-[#e8453c]/30 bg-[#e8453c]/8 px-5 py-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-[#e8453c]/80 transition-all hover:border-[#e8453c]/60 hover:bg-[#e8453c]/14 hover:text-[#e8453c]"
                >
                  Browse films with {person.name.split(" ")[0]}
                  <ArrowUpRight className="h-3 w-3" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <div className="relative bg-[#0a0a10]">
        <div
          className="pointer-events-none absolute -top-px left-1/2 h-px w-[80vw] -translate-x-1/2"
          style={{ background: "linear-gradient(to right, transparent, #e8453c22, transparent)" }}
        />

        <div className="mx-auto max-w-5xl space-y-20 px-6 py-20 lg:px-10">

          {/* ── AWARD HISTORY ─────────────────────────────────────────── */}
          {awardBodies.length > 0 && (
            <section>
              <SectionLabel>Award History</SectionLabel>

              <div className="mt-10 space-y-6">
                {awardBodies.map((body) => (
                  <AwardBodyCard key={body.code} body={body} />
                ))}
              </div>
            </section>
          )}

          {/* ── FILMOGRAPHY ───────────────────────────────────────────── */}
          {person.films.length > 0 && (
            <section>
              <SectionLabel>Filmography</SectionLabel>
              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {person.films.map((film) => (
                  <FilmPosterCard key={film.id} film={film} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

// ── Stat ─────────────────────────────────────────────────────────────────────

function Stat({ value, label, accent }: { value: number; label: string; accent: boolean }) {
  return (
    <div>
      <span
        className="block font-[family-name:var(--font-display)] font-bold leading-none tabular-nums"
        style={{
          fontSize: "clamp(2.2rem,4.5vw,3.5rem)",
          color: accent ? "#e8453c" : "#f8f8f4",
        }}
      >
        {value}
      </span>
      <p className="mt-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.5em] text-[#555570]">
        {label}
      </p>
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[#e8453c]">◆</span>
      <h2 className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.5em] text-[#c8c8e0]">
        {children}
      </h2>
      <div className="h-px flex-1 bg-gradient-to-r from-[#2a2a42] to-transparent" />
    </div>
  );
}

// ── Award body card ───────────────────────────────────────────────────────────

function AwardBodyCard({
  body,
}: {
  body: { label: string; code: string; records: AwardRow[]; wins: number };
}) {
  const sorted = [...body.records].sort(
    (a, b) =>
      (b.won ? 1 : 0) - (a.won ? 1 : 0) ||
      b.awardYear - a.awardYear ||
      a.category.localeCompare(b.category),
  );

  return (
    <article className="overflow-hidden border border-[#1e1e30]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1a1a28] bg-[#0d0d18] px-5 py-4">
        <div>
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.55em] text-[#444460]">
            {body.code}
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold text-[#e0e0f0]">
            {body.label}
          </h3>
        </div>
        <div className="flex items-baseline gap-6">
          <div className="text-right">
            <span
              className="block font-[family-name:var(--font-display)] text-2xl font-bold leading-none tabular-nums"
              style={{ color: body.wins > 0 ? "#e8453c" : "#3a3a58" }}
            >
              {body.wins}
            </span>
            <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.4em] text-[#555570]">
              Wins
            </span>
          </div>
          <div className="text-right">
            <span className="block font-[family-name:var(--font-display)] text-xl font-bold leading-none tabular-nums text-[#555570]">
              {body.records.length}
            </span>
            <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.4em] text-[#555570]">
              Noms
            </span>
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#0b0b12]">
        {sorted.map((r) => (
          <div
            key={`${r.awardYear}-${r.category}-${r.filmSlug}`}
            className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 border-l-2 px-5 py-3.5 ${
              r.won ? "border-l-[#D4AF37]/50 bg-[#0e0d09]" : "border-l-transparent bg-[#080810]"
            }`}
          >
            <span
              className={`shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.4em] ${
                r.won ? "text-[#c8a048]" : "text-[#2a2a3a]"
              }`}
            >
              {r.won ? "◆ Won" : "Nom"}
            </span>
            <div className="min-w-0">
              <p
                className={`text-[0.8rem] font-medium leading-5 ${
                  r.won ? "text-[#e8ddb8]" : "text-[#9090a8]"
                }`}
              >
                {r.category}
              </p>
              <Link
                href={`/film/${r.filmSlug}`}
                className="group mt-0.5 inline-flex items-center gap-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#555570] transition-colors hover:text-[#e8453c]"
              >
                {r.filmTitle}
                <span className="text-[#2a2a3a] transition-colors group-hover:text-[#e8453c]">
                  ({r.releaseYear})
                </span>
              </Link>
            </div>
            <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-[#444460]">
              {r.awardYear}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

// ── Film poster card ──────────────────────────────────────────────────────────

function FilmPosterCard({ film }: { film: FilmRow }) {
  const initials = film.title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();

  return (
    <Link
      href={`/film/${film.slug}`}
      className="group relative flex flex-col overflow-hidden border border-[#1e1e30] bg-[#0d0d18] transition-all duration-300 hover:border-[#e8453c]/30 hover:shadow-lg hover:shadow-[#e8453c]/5"
    >
      {/* Poster */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "2/3" }}>
        {film.posterUrl ? (
          <Image
            src={tmdbImageUrl(film.posterUrl, "w342") ?? film.posterUrl}
            alt={film.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            placeholder="blur"
            blurDataURL={blurDataUrl(null)}
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#0a0a14]">
            <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-white/12">
              {initials}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070b] via-[#07070b]/20 to-transparent" />

        {/* Role tag */}
        <div className="absolute left-2 top-2">
          <span
            className={`px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] ${
              film.role === "director"
                ? "bg-[#e8453c]/80 text-white"
                : "bg-black/60 text-white/50"
            }`}
          >
            {film.role}
          </span>
        </div>

        {film.imdbRating != null && (
          <div className="absolute bottom-2 right-2">
            <span className="bg-black/70 px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] text-[#c8a048] backdrop-blur-sm">
              {film.imdbRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-2.5 pb-3.5 pt-2">
        <p className="line-clamp-2 text-[0.75rem] font-semibold leading-[1.35] text-[#d4d4e8] transition-colors group-hover:text-white">
          {film.title}
        </p>
        <p className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] text-[#444460]">
          {film.releaseYear}
        </p>
      </div>
    </Link>
  );
}
