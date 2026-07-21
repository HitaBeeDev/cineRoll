"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Compass, Download, RotateCcw, Share2, Sparkles, X } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { useToast } from "@/components/ui/toast";
import {
  fetchTasteQuestions,
  fetchTasteTiebreaker,
  submitTasteResult,
  type TasteComparison,
  type TasteQuestion,
  type TasteQuestionOption,
  type TasteRecFilm,
  type TasteResult,
} from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { blurDataUrl, tmdbImageUrl } from "@/lib/images";
import { dnaBars, insights, whyReasons } from "@/lib/taste-insights";
import { drawShareCard, renderShareCard, type ShareCardData } from "@/lib/share-card";
import { cn } from "@/lib/utils";

/** #rrggbb + alpha → rgba() for accent-tinted inline styles. */
function withAlpha(hex: string, alpha: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1]!, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

type Phase = "intro" | "quiz" | "prep" | "finale" | "scoring" | "result" | "error";

const TYPE_LABEL: Record<string, string> = {
  movie: "Film",
  documentary: "Documentary",
  animation: "Animation",
  short: "Short",
  "tv-series": "Series",
};

export function TasteTestClient() {
  const reduceMotion = useReducedMotion();

  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<TasteQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [comparisons, setComparisons] = useState<TasteComparison[]>([]);
  const [tiebreak, setTiebreak] = useState<TasteQuestion | null>(null);
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

  // A round hands back one *or more* comparisons (pair → 1, grid → 3, podium →
  // 3). We append them, advance, and — once the planned rounds are done — look
  // for a finale tiebreaker before reading the result.
  async function answer(newComparisons: TasteComparison[]) {
    const next = [...comparisons, ...newComparisons];
    setComparisons(next);

    if (index + 1 < questions.length) {
      setIndex(index + 1);
      return;
    }

    // Planned rounds done — see if a finale is needed to break a close call.
    setPhase("prep");
    const tb = await fetchTasteTiebreaker(next);
    if (tb) {
      setTiebreak(tb);
      setPhase("finale");
      return;
    }
    await finish(next);
  }

  // The finale is a single pair; its answer completes the run.
  async function answerFinale(comparison: TasteComparison) {
    await finish([...comparisons, comparison]);
  }

  async function finish(all: TasteComparison[]) {
    setPhase("scoring");
    try {
      const res = await submitTasteResult(all);
      setResult(res);
      setPhase("result");
    } catch {
      setPhase("error");
    }
  }

  function retake() {
    setResult(null);
    setComparisons([]);
    setTiebreak(null);
    setIndex(0);
    setPhase("intro");
    void fetchTasteQuestions()
      .then(setQuestions)
      .catch(() => {});
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
              onAnswer={answer}
              reduceMotion={reduceMotion}
            />
          )}

          {phase === "prep" && <ScoringPanel key="prep" steps={PREP_STEPS} />}

          {phase === "finale" && tiebreak && (
            <QuizPanel
              key="finale"
              question={tiebreak}
              index={0}
              total={1}
              onAnswer={(cmps) => answerFinale(cmps[0]!)}
              reduceMotion={reduceMotion}
              finale
            />
          )}

          {phase === "scoring" && <ScoringPanel key="scoring" />}

          {phase === "result" && result && (
            <ResultPanel
              key="result"
              result={result}
              onRetake={retake}
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
        A handful of gut calls — pick, pick again, rank a few. We read your taste,
        give it a name, and hand you exactly what to watch next.
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
  onAnswer,
  reduceMotion,
  finale = false,
}: {
  question: TasteQuestion;
  index: number;
  total: number;
  /** A round yields one (pair) or several (grid/podium) comparisons at once. */
  onAnswer: (comparisons: TasteComparison[]) => void;
  reduceMotion: boolean | null;
  finale?: boolean;
}) {
  const progress = (index / total) * 100;
  return (
    <motion.section
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-1 flex-col"
    >
      {finale ? (
        <p className="text-center font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.32em] text-[#e8453c]/80">
          ◈ Final call ◈
        </p>
      ) : (
        <div className="mx-auto w-full max-w-md">
          <div className="mb-2 flex items-center justify-between font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.24em] text-[#888899]">
            <span>Round {index + 1} / {total}</span>
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
      )}

      {/* Prompt + board are keyed together by question id, so the headline always
          swaps in lockstep with the posters — the prompt never lingers over the
          previous round's board while the crossfade runs. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center"
        >
          <h2 className="mt-8 text-center font-[family-name:var(--font-display)] text-2xl font-bold leading-tight sm:text-3xl">
            {question.prompt}
          </h2>
          <div className="mt-6 flex w-full flex-col items-center">
            {question.kind === "pair" && <PairBoard question={question} onAnswer={onAnswer} />}
            {question.kind === "grid" && <GridBoard question={question} onAnswer={onAnswer} />}
            {question.kind === "podium" && <PodiumBoard question={question} onAnswer={onAnswer} />}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}

/** Two posters, pick one → one comparison (chosen vs the other). */
function PairBoard({
  question,
  onAnswer,
}: {
  question: TasteQuestion;
  onAnswer: (comparisons: TasteComparison[]) => void;
}) {
  const [a, b] = question.options;
  if (!a || !b) return null;
  return (
    // Height-bounded so both posters and their titles always fit the viewport
    // without scrolling; each poster is `h-full aspect-[2/3]`, so width follows
    // height and the pair scales to the space available.
    <div
      style={{ height: "min(58vh, 540px)" }}
      className="relative mx-auto flex w-full max-w-3xl items-stretch justify-center gap-3 sm:gap-5"
    >
      <Poster
        option={a}
        className="h-full aspect-[2/3]"
        onClick={() => onAnswer([{ chosenId: a.id, otherId: b.id }])}
      />
      <Poster
        option={b}
        className="h-full aspect-[2/3]"
        onClick={() => onAnswer([{ chosenId: b.id, otherId: a.id }])}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2a2a3e] bg-[#09090f] px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#888899] shadow-lg shadow-black/50"
      >
        or
      </span>
    </div>
  );
}

/** Four posters, pick one → three comparisons (the pick vs each of the rest). */
function GridBoard({
  question,
  onAnswer,
}: {
  question: TasteQuestion;
  onAnswer: (comparisons: TasteComparison[]) => void;
}) {
  const options = question.options;
  function pick(chosen: TasteQuestionOption) {
    onAnswer(
      options
        .filter((o) => o.id !== chosen.id)
        .map((o) => ({ chosenId: chosen.id, otherId: o.id })),
    );
  }
  // A 2×2 of 2:3 posters is itself a 2:3 block, so height-bound it exactly like
  // the pair — the whole grid scales to fit the viewport, no scrolling.
  return (
    <div
      style={{ height: "min(58vh, 540px)" }}
      className="mx-auto grid aspect-[2/3] grid-cols-2 grid-rows-2 gap-3 sm:gap-4"
    >
      {options.map((o) => (
        <Poster key={o.id} option={o} className="h-full w-full" onClick={() => pick(o)} />
      ))}
    </div>
  );
}

/** Three posters, tap in preference order → three ordered comparisons. */
function PodiumBoard({
  question,
  onAnswer,
}: {
  question: TasteQuestion;
  onAnswer: (comparisons: TasteComparison[]) => void;
}) {
  const options = question.options;
  const [ranked, setRanked] = useState<string[]>([]);

  // Tapping a ranked poster un-ranks it; tapping an unranked one appends it.
  // When the tap completes the ranking, expand the order into pairwise "beats"
  // comparisons (1st beats 2nd & 3rd, 2nd beats 3rd) and answer — done here in
  // the handler, not an effect, so completion is a direct result of the tap.
  const toggle = (id: string) => {
    const next = ranked.includes(id) ? ranked.filter((x) => x !== id) : [...ranked, id];
    setRanked(next);
    if (next.length !== options.length) return;
    const comparisons: TasteComparison[] = [];
    for (let i = 0; i < next.length; i++) {
      for (let j = i + 1; j < next.length; j++) {
        comparisons.push({ chosenId: next[i]!, otherId: next[j]! });
      }
    }
    onAnswer(comparisons);
  };

  return (
    <div className="w-full">
      <p className="mb-4 text-center font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#6c6c80]">
        Tap in order — favourite first
      </p>
      {/* Three 2:3 posters in a row form a 2:1 block — height-bound so it fits. */}
      <div
        style={{ height: "min(50vh, 430px)" }}
        className="mx-auto grid aspect-[2/1] grid-cols-3 grid-rows-1 gap-2.5 sm:gap-4"
      >
        {options.map((o) => {
          const pos = ranked.indexOf(o.id);
          return (
            <Poster
              key={o.id}
              option={o}
              className="h-full w-full"
              rank={pos >= 0 ? pos + 1 : null}
              active={pos >= 0}
              onClick={() => toggle(o.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * A single choosable poster — shared by every round. `rank` stamps a numbered
 * badge (podium); `active` lights the accent border once picked.
 */
function Poster({
  option,
  onClick,
  className,
  rank = null,
  active = false,
}: {
  option: TasteQuestionOption;
  onClick: () => void;
  className?: string;
  rank?: number | null;
  active?: boolean;
}) {
  const src = tmdbImageUrl(option.posterUrl, "w500");
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rank ? `${option.title} (${option.year}), ranked ${rank}` : `Choose ${option.title} (${option.year})`}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-[#11111a] text-left",
        "transition-all duration-200 hover:-translate-y-1 hover:border-[#e8453c]/60 hover:shadow-[0_24px_60px_rgba(0,0,0,0.5)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
        active ? "border-[#e8453c]" : "border-[#1e1e2a]",
        className,
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
      {/* Red wash on hover / selection to signal "this one" */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-colors duration-200 group-hover:bg-[#e8453c]/10",
          active ? "bg-[#e8453c]/15" : "bg-[#e8453c]/0",
        )}
      />
      {rank != null && (
        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#e8453c] font-[family-name:var(--font-geist-mono)] text-sm font-bold text-[#09090f] shadow-lg shadow-black/40">
          {rank}
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        <h3 className="font-[family-name:var(--font-display)] text-base font-bold leading-tight sm:text-xl">
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

// The reveal cycles a few lines so the wait reads as the model *working*, not a
// spinner. Steps advance on a timer; the last line holds until the result lands.
const SCORING_STEPS = [
  "Analysing your cinematic instincts…",
  "Weighing what you chose against what you passed on…",
  "Naming your taste…",
];

// Shown while we fetch the finale tiebreaker (a quick beat before the last call).
const PREP_STEPS = ["Reading your picks…"];

function ScoringPanel({ steps = SCORING_STEPS }: { steps?: string[] }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setStep((s) => Math.min(s + 1, steps.length - 1)),
      900,
    );
    return () => clearInterval(id);
  }, [steps.length]);
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-1 flex-col items-center justify-center py-24 text-center"
    >
      <Sparkles className="h-8 w-8 animate-pulse text-[#e8453c]" aria-hidden />
      <div className="mt-5 h-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.32em] text-[#888899]"
          >
            {steps[step]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

/* ── Result ─────────────────────────────────────────────────────────────── */

/** Fades + lifts a result section in, staggered by `delay` for a cinematic reveal. */
function Reveal({
  delay,
  reduceMotion,
  className,
  children,
}: {
  delay: number;
  reduceMotion: boolean | null;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ResultPanel({
  result,
  onRetake,
  reduceMotion,
}: {
  result: TasteResult;
  onRetake: () => void;
  reduceMotion: boolean | null;
}) {
  const { archetype, secondaryArchetype, traits, profile, hero, recommendations } = result;
  const accent = archetype.accent;
  const [shareOpen, setShareOpen] = useState(false);

  const bars = dnaBars(profile);
  const reads = insights(profile);
  const reasons = whyReasons(profile);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ ["--accent" as string]: accent }}
      className="flex flex-1 flex-col pb-10"
    >
      {/* ── Hero ── */}
      <Reveal delay={0} reduceMotion={reduceMotion} className="relative">
        {/* Accent glow standing in for the "cinematic background". */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-6 h-72"
          style={{
            background: `radial-gradient(60% 100% at 50% 0%, ${withAlpha(accent, 0.22)} 0%, transparent 70%)`,
          }}
        />
        <div className="relative pt-8 text-center">
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.32em] text-[#888899]">
            Your cinematic archetype
          </p>
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-full text-5xl sm:h-28 sm:w-28 sm:text-6xl"
            style={{
              background: withAlpha(accent, 0.12),
              boxShadow: `0 0 60px ${withAlpha(accent, 0.35)}`,
              border: `1px solid ${withAlpha(accent, 0.4)}`,
            }}
          >
            {archetype.emoji}
          </motion.div>
          <h1
            className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-none tracking-tight sm:text-6xl"
            style={{ color: accent }}
          >
            {archetype.label}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-base leading-7 text-[#c8c8d4] sm:text-lg">
            {archetype.blurb}
          </p>
          {traits.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {traits.map((t) => (
                <span
                  key={t}
                  className="rounded-full border px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.16em]"
                  style={{ borderColor: withAlpha(accent, 0.35), color: "#e6e6ee", background: withAlpha(accent, 0.06) }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <p className="mt-5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#7c7c8c]">
            Secondary leaning · {secondaryArchetype.emoji} {secondaryArchetype.label}
          </p>

          {/* Actions — Explore leads, Share is secondary, Retake recedes. */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-[family-name:var(--font-geist-mono)] text-[12px] font-bold uppercase tracking-[0.16em] text-[#09090f] transition-all hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]"
              style={{ background: accent }}
            >
              <Compass className="h-4 w-4" aria-hidden />
              Explore your taste
            </Link>
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[#2a2a3e] bg-[#11111b] px-5 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.16em] text-[#F5F5F0] transition-colors hover:border-[#6a6a85] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
            >
              <Share2 className="h-3.5 w-3.5" aria-hidden />
              Share result
            </button>
            <button
              type="button"
              onClick={onRetake}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.16em] text-[#6c6c80] transition-colors hover:text-[#b6b6c6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Retake
            </button>
          </div>
        </div>
      </Reveal>

      {/* ── Perfect match ── */}
      {hero && (
        <Reveal delay={0.2} reduceMotion={reduceMotion} className="mt-14">
          <SectionHeading accent={accent}>Your perfect match</SectionHeading>
          <div className="mt-4">
            <HeroRecCard film={hero} accent={accent} reasons={reasons} />
          </div>
        </Reveal>
      )}

      {/* ── Cinematic DNA + what the picks revealed ── */}
      <Reveal delay={0.3} reduceMotion={reduceMotion} className="mt-14">
        <SectionHeading accent={accent}>Your cinematic DNA</SectionHeading>
        <div className="mt-5 grid gap-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8 md:grid-cols-2">
          <div className="flex flex-col justify-center gap-6">
            {bars.map((bar) => (
              <DnaBar key={bar.key} bar={bar} accent={accent} />
            ))}
          </div>
          <div className="flex flex-col justify-center">
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#888899]">
              What your picks revealed
            </p>
            <ul className="mt-4 space-y-3">
              {reads.map((line) => (
                <li key={line} className="flex gap-3 text-[15px] leading-6 text-[#d0d0da]">
                  <span aria-hidden style={{ color: accent }} className="mt-0.5 shrink-0">
                    ▸
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      {/* ── And in every kind ── */}
      {recommendations.length > 0 && (
        <Reveal delay={0.4} reduceMotion={reduceMotion} className="mt-14">
          <SectionHeading accent={accent}>And a pick in every kind</SectionHeading>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
            {recommendations.map((film) => (
              <RecCard key={film.id} film={film} accent={accent} />
            ))}
          </div>
        </Reveal>
      )}

      <AnimatePresence>
        {shareOpen && (
          <ShareModal
            result={result}
            bars={bars}
            onClose={() => setShareOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function SectionHeading({ accent, children }: { accent: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${withAlpha(accent, 0.3)})` }} />
      <h2 className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.24em] text-[#9a9aa8]">
        {children}
      </h2>
      <span aria-hidden className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${withAlpha(accent, 0.3)})` }} />
    </div>
  );
}

function MatchBadge({ match, accent }: { match: number; accent: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.1em]"
      style={{ background: withAlpha(accent, 0.16), color: accent, border: `1px solid ${withAlpha(accent, 0.4)}` }}
    >
      {match}% match
    </span>
  );
}

function HeroRecCard({
  film,
  accent,
  reasons,
}: {
  film: TasteRecFilm;
  accent: string;
  reasons: { label: string; desc: string }[];
}) {
  const poster = tmdbImageUrl(film.posterUrl, "w342");
  const backdrop = tmdbImageUrl(film.backdropUrl, "w780");
  return (
    <Link
      href={`/film/${film.slug}`}
      onClick={() =>
        trackEvent({
          type: "recommendation_click",
          filmId: film.id,
          context: { source: "taste_test_hero", slug: film.slug },
        })
      }
      className="group relative flex gap-5 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11111a] p-4 transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] sm:p-5"
      style={{ borderColor: withAlpha(accent, 0.25) }}
    >
      {backdrop && (
        <>
          <Image
            src={backdrop}
            alt=""
            fill
            aria-hidden
            sizes="(max-width: 900px) 100vw, 900px"
            className="object-cover opacity-[0.16] transition-opacity duration-300 group-hover:opacity-25"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#11111a] via-[#11111a]/85 to-[#11111a]/40" />
        </>
      )}
      <div className="relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#0a0a14] sm:w-32">
        {poster ? (
          <Image
            src={poster}
            alt={film.title}
            fill
            sizes="128px"
            placeholder="blur"
            blurDataURL={blurDataUrl(film.posterColor)}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0a0a14]" />
        )}
      </div>
      <div className="relative flex min-w-0 flex-col justify-center py-1">
        <MatchBadge match={film.match} accent={accent} />
        <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-[#f4f2fa] sm:text-3xl">
          {film.title}
          <span className="ml-2 text-lg font-normal text-[#9d98ad]">{film.year}</span>
        </h3>
        {film.genres.length > 0 && (
          <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#9d98ad]">
            {film.genres.slice(0, 3).join(" · ")}
          </p>
        )}
        {reasons.length > 0 && (
          <p className="mt-3 text-sm leading-6 text-[#c8c8d4]">
            <span className="text-[#8b8b9a]">Because you value </span>
            {reasons.map((r, i) => (
              <span key={r.label}>
                <span style={{ color: accent }}>{r.label.toLowerCase()}</span>
                {i < reasons.length - 1 ? " · " : ""}
              </span>
            ))}
          </p>
        )}
        <span className="mt-4 inline-flex items-center gap-1 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.16em] text-[#b6b6c6] transition-colors group-hover:text-white">
          View film <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

function DnaBar({ bar, accent }: { bar: { left: string; right: string; value: number }; accent: string }) {
  const leansRight = bar.value >= 50;
  const strength = leansRight ? bar.value : 100 - bar.value;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.12em]">
        <span className={leansRight ? "text-[#5c5c6c]" : "text-[#e6e6ee]"}>{bar.left}</span>
        <span className={leansRight ? "text-[#e6e6ee]" : "text-[#5c5c6c]"}>{bar.right}</span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-[#1c1c28]">
        <motion.div
          className="absolute top-0 h-full rounded-full"
          style={{
            background: accent,
            [leansRight ? "right" : "left"]: 0,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${strength}%` }}
          transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function RecCard({ film, accent }: { film: TasteRecFilm; accent: string }) {
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
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/[0.08] bg-[#11111a] transition-all duration-300 group-hover:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-[#e8453c]">
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
        <span className="absolute left-2 top-2 rounded-full border border-white/15 bg-black/75 px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#d8d8df] backdrop-blur-sm">
          {TYPE_LABEL[film.contentType] ?? film.contentType}
        </span>
        <span
          className="absolute right-2 top-2 rounded-full px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold backdrop-blur-sm"
          style={{ background: withAlpha(accent, 0.9), color: "#09090f" }}
        >
          {film.match}%
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

/* ── Share card ─────────────────────────────────────────────────────────── */

function ShareModal({
  result,
  bars,
  onClose,
}: {
  result: TasteResult;
  bars: ShareCardData["bars"];
  onClose: () => void;
}) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);

  const heroTitle = result.hero?.title ?? result.recommendations[0]?.title ?? null;
  const data: ShareCardData = {
    archetypeLabel: result.archetype.label,
    emoji: result.archetype.emoji,
    accent: result.archetype.accent,
    secondaryLabel: result.secondaryArchetype.label,
    bars,
    heroTitle,
  };

  // Draw the preview once mounted, and close on Escape.
  useEffect(() => {
    if (canvasRef.current) drawShareCard(canvasRef.current, data);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // data is derived from a stable result; redrawing on identity churn is fine.
  }, []);

  const filename = `cineroll-${result.archetype.key}.png`;

  async function onDownload() {
    setBusy(true);
    try {
      const blob = await renderShareCard(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Couldn't create the image", description: "Please try again." });
    } finally {
      setBusy(false);
    }
  }

  async function onShare() {
    setBusy(true);
    const url = typeof window !== "undefined" ? `${window.location.origin}/taste-test` : "";
    const text = `I'm a ${result.archetype.label} ${result.archetype.emoji} on the CineRoll Taste Test`;
    try {
      const blob = await renderShareCard(data);
      const file = new File([blob], filename, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({ title: "CineRoll Taste Test", text, files: [file] });
      } else if (navigator.share) {
        await navigator.share({ title: "CineRoll Taste Test", text, url });
      } else {
        await navigator.clipboard.writeText(`${text} — ${url}`);
        toast({ title: "Copied to clipboard", description: "Share your archetype." });
      }
    } catch {
      /* user dismissed the share sheet — nothing to do */
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Share your result"
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-sm flex-col items-center rounded-2xl border border-white/10 bg-[#0d0d16] p-5"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1.5 text-[#888899] transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
        <canvas
          ref={canvasRef}
          className="w-full max-w-[280px] rounded-xl shadow-2xl shadow-black/50"
          style={{ aspectRatio: "1080 / 1350" }}
        />
        <div className="mt-5 flex w-full gap-3">
          <button
            type="button"
            onClick={onShare}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.16em] text-[#09090f] transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: result.archetype.accent }}
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden />
            Share
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.16em] text-[#F5F5F0] transition-colors hover:border-white/40 disabled:opacity-60"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
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
