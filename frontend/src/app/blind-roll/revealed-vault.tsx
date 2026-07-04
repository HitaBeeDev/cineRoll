"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clapperboard } from "lucide-react";
import type { RollFilm } from "@/lib/api";
import type { ShareStatus } from "./types";
import { ChallengeButton, NextFilmButton } from "./vault-actions";

type RevealedVaultProps = {
  film: RollFilm;
  correct: boolean | null;
  shareStatus: ShareStatus;
  reduced: boolean;
  onChallengeFriend: () => void;
  onNextFilm: () => void;
};

export function RevealedVault({
  film,
  correct,
  shareStatus,
  reduced,
  onChallengeFriend,
  onNextFilm,
}: RevealedVaultProps) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="flex h-full min-h-0 flex-col gap-3"
    >
      {correct && <CaseCrackedBanner reduced={reduced} />}
      <PosterReveal film={film} correct={correct} />
      <Link
        href={`/film/${film.slug}`}
        className="flex h-14 items-center justify-center rounded-xl bg-[#e8453c] font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b]"
      >
        View Film
      </Link>
      <ChallengeButton shareStatus={shareStatus} onClick={onChallengeFriend} />
      <NextFilmButton onClick={onNextFilm} />
    </motion.div>
  );
}

function CaseCrackedBanner({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="relative overflow-hidden rounded-xl border border-[#4ade80]/45 bg-[#4ade80]/10 px-4 py-3 text-center shadow-[0_0_40px_rgba(74,222,128,0.12)]"
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[#bbf7d0]/70" />
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.22em] text-[#4ade80]">
        Case cracked
      </p>
      <p className="mt-1 text-sm text-[#d4d4df]">Perfect read. You found the hidden film.</p>
    </motion.div>
  );
}

function PosterReveal({ film, correct }: { film: RollFilm; correct: boolean | null }) {
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-[#2a2a3e] bg-[#09090f] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      {film.posterUrl ? (
        <Image src={film.posterUrl} alt={film.title} fill sizes="380px" className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Clapperboard className="h-12 w-12 text-[#2a2a3e]" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/78 to-transparent p-4 pt-20 text-center">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.24em] text-[#D4AF37]">
          {correct ? "Case Closed" : "The Answer"}
        </p>
        <h2 className="mt-2 line-clamp-2 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight">
          {film.title}
        </h2>
        <p className="mt-1 text-sm text-[#d4d4df]">{film.year}</p>
      </div>
    </div>
  );
}
