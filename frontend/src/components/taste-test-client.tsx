"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, RotateCcw, Share2, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { useToast } from "@/components/ui/toast";
import {
  fetchTasteQuestions,
  submitTasteResult,
  type TasteComparison,
  type TasteQuestion,
  type TasteQuestionOption,
  type TasteRecFilm,
  type TasteResult,
} from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { blurDataUrl, tmdbImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

type Phase = "intro" | "quiz" | "scoring" | "result" | "error";

const TYPE_LABEL: Record<string, string> = {
  movie: "Film",
  documentary: "Documentary",
  animation: "Animation",
  short: "Short",
  "tv-series": "Series",
};

export function TasteTestClient() {
  const reduceMotion = useReducedMotion();
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<TasteQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [comparisons, setComparisons] = useState<TasteComparison[]>([]);
  const [result, setResult] = useState<TasteResult | null>(null);

  // Prefetch the questions on mount so "Begin" is instant. A failure surfaces
  // only if the user actually tries to start (handled in `begin`).
  useEffect(() => {
    let cancelled = false;
    void fetchTasteQuestions()
      .then((qs) => {
        if (!cancelled) setQuestions(qs);
      })
      .catch(() => {
        /* retried on Begin */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function begin() {
    let qs = questions;
    if (qs.length === 0) {
      try {
        qs = await fetchTasteQuestions();
        setQuestions(qs);
      } catch {
        setPhase("error");
        return;
      }
    }
    setComparisons([]);
    setIndex(0);
    setPhase("quiz");
  }

  async function choose(option: TasteQuestionOption) {
    const question = questions[index];
    if (!question) return;
    // Record both sides of the fork: the model reads the pick as a vote on the
    // axis where the chosen and rejected films actually differ.
    const otherId = question.a.id === option.id ? question.b.id : question.a.id;
    const next = [...comparisons, { chosenId: option.id, otherId }];
    setComparisons(next);

    if (index + 1 < questions.length) {
      setIndex(index + 1);
      return;
    }

    // Last pick — read the taste.
    setPhase("scoring");
    try {
      const res = await submitTasteResult(next);
      setResult(res);
      setPhase("result");
    } catch {
      setPhase("error");
    }
  }

  function retake() {
    setResult(null);
    setComparisons([]);
    setIndex(0);
    setPhase("intro");
    void fetchTasteQuestions()
      .then(setQuestions)
      .catch(() => {});
  }

  async function share() {
    if (!result) return;
    const text = `I'm a ${result.archetype.label} ${result.archetype.emoji} on the CineRoll Taste Test`;
    const url = typeof window !== "undefined" ? `${window.location.origin}/taste-test` : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: "CineRoll Taste Test", text, url });
      } else {
        await navigator.clipboard.writeText(`${text} — ${url}`);
        toast({ title: "Copied to clipboard", description: "Share your archetype." });
      }
    } catch {
      /* user dismissed the share sheet — nothing to do */
    }
  }

  return (
    // flex-1 (not min-h-screen) so the page fills the viewport *minus* the global
    // footer — using min-h-screen here would stack a full 100vh on top of the
    // footer and force a page scrollbar even when the content fits (e.g. the
    // intro). Tall states like the result simply grow and scroll naturally.
    <div className="flex min-h-0 flex-1 flex-col bg-[#09090f] text-[#F5F5F0]">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-8 sm:py-10">
        <AnimatePresence mode="wait">
          {phase === "intro" && <IntroPanel key="intro" onBegin={begin} reduceMotion={reduceMotion} />}

          {phase === "quiz" && questions[index] && (
            <QuizPanel
              key="quiz"
              question={questions[index]}
              index={index}
              total={questions.length}
              onChoose={choose}
              reduceMotion={reduceMotion}
            />
          )}

          {phase === "scoring" && <ScoringPanel key="scoring" />}

          {phase === "result" && result && (
            <ResultPanel
              key="result"
              result={result}
              onRetake={retake}
              onShare={share}
              reduceMotion={reduceMotion}
            />
          )}

          {phase === "error" && (
            <ErrorPanel key="error" onRetry={() => (phase === "error" ? retake() : undefined)} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ── Intro ──────────────────────────────────────────────────────────────── */

function IntroPanel({
  onBegin,
  reduceMotion,
}: {
  onBegin: () => void;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.section
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-1 flex-col items-center justify-center py-16 text-center"
    >
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.32em] text-[#e8453c]/80">
        ◈ Taste Test ◈
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl font-bold leading-none tracking-tight sm:text-7xl">
        What&apos;s your <span className="text-[#e8453c]">taste?</span>
      </h1>
      <p className="mt-6 max-w-xl text-balance text-base leading-7 text-[#b6b6c6] sm:text-lg">
        Ten films, ten gut calls — just pick the one you&apos;d rather watch. We
        read your taste, give it a name, and hand you exactly what to watch next.
      </p>
      <button
        type="button"
        onClick={onBegin}
        className={cn(
          "mt-9 inline-flex items-center gap-2 rounded-full bg-[#e8453c] px-8 py-4",
          "font-[family-name:var(--font-geist-mono)] text-sm font-bold uppercase tracking-[0.18em] text-[#09090f]",
          "transition-all hover:bg-[#d5342b] hover:shadow-[0_0_44px_rgba(232,69,60,0.34)] active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
        )}
      >
        Begin
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
      <p className="mt-4 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#6c6c80]">
        ~30 seconds · no account needed
      </p>
    </motion.section>
  );
}

/* ── Quiz ───────────────────────────────────────────────────────────────── */

function QuizPanel({
  question,
  index,
  total,
  onChoose,
  reduceMotion,
}: {
  question: TasteQuestion;
  index: number;
  total: number;
  onChoose: (option: TasteQuestionOption) => void;
  reduceMotion: boolean | null;
}) {
  const progress = ((index) / total) * 100;
  return (
    <motion.section
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-1 flex-col"
    >
      {/* Progress */}
      <div className="mx-auto w-full max-w-md">
        <div className="mb-2 flex items-center justify-between font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.24em] text-[#888899]">
          <span>Question {index + 1} / {total}</span>
          <span className="text-[#6c6c80]">Read at the end</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-[#1a1a26]">
          <motion.div
            className="h-full rounded-full bg-[#e8453c]"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      <h2 className="mt-8 text-center font-[family-name:var(--font-display)] text-2xl font-bold leading-tight sm:text-3xl">
        Which one are you tonight?
      </h2>

      {/* The pair. Keyed by question id so each round animates in fresh. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          // Height-bounded so both posters and their titles always fit the
          // viewport without scrolling; each choice is `h-full aspect-[2/3]`, so
          // width follows height and the pair scales to the space available.
          style={{ height: "min(58vh, 540px)" }}
          className="relative mx-auto mt-6 flex w-full max-w-3xl items-stretch justify-center gap-3 sm:gap-5"
        >
          <PosterChoice option={question.a} onChoose={onChoose} />
          <PosterChoice option={question.b} onChoose={onChoose} />
          {/* VS badge */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2a2a3e] bg-[#09090f] px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#888899] shadow-lg shadow-black/50"
          >
            or
          </span>
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}

function PosterChoice({
  option,
  onChoose,
}: {
  option: TasteQuestionOption;
  onChoose: (option: TasteQuestionOption) => void;
}) {
  const src = tmdbImageUrl(option.posterUrl, "w500");
  return (
    <button
      type="button"
      onClick={() => onChoose(option)}
      aria-label={`Choose ${option.title} (${option.year})`}
      className={cn(
        "group relative h-full aspect-[2/3] overflow-hidden rounded-xl border border-[#1e1e2a] bg-[#11111a] text-left",
        "transition-all duration-200 hover:-translate-y-1 hover:border-[#e8453c]/60 hover:shadow-[0_24px_60px_rgba(0,0,0,0.5)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={option.title}
          fill
          draggable={false}
          sizes="(max-width: 640px) 45vw, 380px"
          placeholder="blur"
          blurDataURL={blurDataUrl(option.posterColor)}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0a0a14]" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090f] via-[#09090f]/25 to-transparent" />
      {/* Red wash on hover to signal "this one" */}
      <div className="pointer-events-none absolute inset-0 bg-[#e8453c]/0 transition-colors duration-200 group-hover:bg-[#e8453c]/10" />
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold leading-tight sm:text-2xl">
          {option.title}
        </h3>
        <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#b6b6c6]">
          {option.year}
        </p>
      </div>
    </button>
  );
}

/* ── Scoring ────────────────────────────────────────────────────────────── */

function ScoringPanel() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-1 flex-col items-center justify-center py-24 text-center"
    >
      <Sparkles className="h-8 w-8 animate-pulse text-[#e8453c]" aria-hidden />
      <p className="mt-5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.32em] text-[#888899]">
        Reading your taste…
      </p>
    </motion.section>
  );
}

/* ── Result ─────────────────────────────────────────────────────────────── */

function ResultPanel({
  result,
  onRetake,
  onShare,
  reduceMotion,
}: {
  result: TasteResult;
  onRetake: () => void;
  onShare: () => void;
  reduceMotion: boolean | null;
}) {
  const { archetype, traits, recommendations } = result;
  return (
    <motion.section
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-1 flex-col py-6"
    >
      {/* Reveal */}
      <div className="text-center">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.32em] text-[#888899]">
          Your archetype
        </p>
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 16 }}
          className="mt-3 text-6xl sm:text-7xl"
        >
          {archetype.emoji}
        </motion.div>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold leading-none tracking-tight sm:text-6xl">
          {archetype.label}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-balance text-base leading-7 text-[#b6b6c6]">
          {archetype.blurb}
        </p>
        {traits.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {traits.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[#2a2a3e] bg-[#11111b] px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.16em] text-[#d8d8df]"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-2 rounded-full border border-[#2a2a3e] bg-[#11111b] px-5 py-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.16em] text-[#F5F5F0] transition-colors hover:border-[#6a6a85] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden />
            Share
          </button>
          <button
            type="button"
            onClick={onRetake}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.16em] text-[#888899] transition-colors hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Retake
          </button>
        </div>
      </div>

      {/* One pick per type — the payoff: what to watch, across every kind. */}
      {recommendations.length > 0 && (
        <div className="mt-12">
          <h2 className="text-center font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.24em] text-[#888899]">
            What to watch — every kind
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
            {recommendations.map((film) => (
              <RecCard key={film.id} film={film} />
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
}

function RecCard({ film }: { film: TasteRecFilm }) {
  const poster = tmdbImageUrl(film.posterUrl, "w342");
  return (
    <Link
      href={`/film/${film.slug}`}
      onClick={() =>
        trackEvent({
          type: "recommendation_click",
          filmId: film.id,
          context: { source: "taste_test_grid", slug: film.slug },
        })
      }
      className="group block focus-visible:outline-none"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/[0.08] bg-[#11111a] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#e8453c]/40 group-focus-visible:ring-2 group-focus-visible:ring-[#e8453c]">
        {poster ? (
          <Image
            src={poster}
            alt={film.title}
            fill
            sizes="(max-width: 640px) 45vw, 200px"
            placeholder="blur"
            blurDataURL={blurDataUrl(film.posterColor)}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0a0a14]" />
        )}
        <span className="absolute left-2 top-2 rounded-full border border-[#2dd4bf]/40 bg-black/75 px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5eead4] backdrop-blur-sm">
          {TYPE_LABEL[film.contentType] ?? film.contentType}
        </span>
      </div>
      <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-[#eeeaf6] transition-colors group-hover:text-white">
        {film.title}
      </h3>
      <p className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] text-[#9d98ad]">
        {film.year}
      </p>
    </Link>
  );
}

/* ── Error ──────────────────────────────────────────────────────────────── */

function ErrorPanel({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-1 flex-col items-center justify-center gap-5 py-24 text-center"
    >
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.28em] text-[#8e899e]">
        Something went wrong
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full border border-[#e8453c]/40 px-5 py-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#ff766d] transition-colors hover:border-[#e8453c]/70 hover:text-white"
      >
        Start over →
      </button>
    </motion.section>
  );
}
