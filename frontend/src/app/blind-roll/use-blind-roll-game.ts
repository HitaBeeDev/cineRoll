"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RollFilm } from "@/lib/api";
import { getAwardSummary, getAwards, getClueCards } from "./lib/award-formatters";
import { fetchBlindRound } from "./blind-roll-api";
import {
  readDifficulty,
  readSessionScore,
  writeDifficulty,
  writeSessionScore,
} from "./blind-roll-storage";
import { resetShareStatusLater, shareBlindRollChallenge } from "./lib/share-challenge";
import type { Difficulty, Phase, SessionScore, ShareStatus } from "./types";

export function useBlindRollGame(challengeSlug: string) {
  const [film, setFilm] = useState<RollFilm | null>(null);
  const [options, setOptions] = useState<RollFilm[]>([]);
  const [phase, setPhase] = useState<Phase>("loading");
  const [selectedFilmId, setSelectedFilmId] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [sessionScore, setSessionScore] = useState<SessionScore>(() => readSessionScore());
  const [difficulty, setDifficulty] = useState<Difficulty>(() => readDifficulty());
  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");
  const [expandedAward, setExpandedAward] = useState<number | null>(null);
  const [examinedAwards, setExaminedAwards] = useState<Set<number>>(() => new Set());
  const difficultyRef = useRef(difficulty);

  const awards = useMemo(() => (film ? getAwards(film) : []), [film]);
  const awardSummary = useMemo(() => getAwardSummary(awards), [awards]);
  const clueCards = useMemo(() => getClueCards(film, difficulty), [difficulty, film]);
  const selectedFilm = useMemo(
    () => options.find((option) => option.id === selectedFilmId) ?? null,
    [options, selectedFilmId],
  );

  const resetRoundState = useCallback(() => {
    setPhase("loading");
    setOptions([]);
    setSelectedFilmId(null);
    setCorrect(null);
    setShareStatus("idle");
    setExpandedAward(null);
    setExaminedAwards(new Set());
  }, []);

  const loadFilm = useCallback(async (slug?: string, nextDifficulty = difficultyRef.current) => {
    resetRoundState();

    try {
      const nextRound = await fetchBlindRound(nextDifficulty, slug || undefined);
      setFilm(nextRound.film);
      setOptions(nextRound.options);
      setPhase("ready");
    } catch {
      setPhase("error");
    }
  }, [resetRoundState]);

  useEffect(() => {
    let ignore = false;

    async function loadInitialRound() {
      resetRoundState();

      try {
        const nextRound = await fetchBlindRound(difficultyRef.current, challengeSlug || undefined);
        if (ignore) return;
        setFilm(nextRound.film);
        setOptions(nextRound.options);
        setPhase("ready");
      } catch {
        if (!ignore) setPhase("error");
      }
    }

    void loadInitialRound();

    return () => {
      ignore = true;
    };
  }, [challengeSlug, resetRoundState]);

  function changeDifficulty(nextDifficulty: Difficulty) {
    if (nextDifficulty === difficulty) return;
    setDifficulty(nextDifficulty);
    writeDifficulty(nextDifficulty);
    difficultyRef.current = nextDifficulty;
    void loadFilm(film?.slug, nextDifficulty);
  }

  function examineAward(index: number) {
    setExpandedAward((prev) => (prev === index ? null : index));
    setExaminedAwards((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }

  function reveal() {
    if (!film || phase === "revealed") return;

    const isCorrect = selectedFilmId === film.id;
    const nextScore = getNextScore(sessionScore, isCorrect);
    setCorrect(isCorrect);
    setSessionScore(nextScore);
    writeSessionScore(nextScore);
    setPhase("revealed");
  }

  async function challengeFriend() {
    if (!film) return;

    const shared = await shareBlindRollChallenge(film.slug, difficulty);
    setShareStatus(shared ? "copied" : "failed");
    resetShareStatusLater(() => setShareStatus("idle"));
  }

  return {
    film,
    options,
    phase,
    correct,
    difficulty,
    sessionScore,
    shareStatus,
    selectedFilm,
    selectedFilmId,
    awards,
    awardSummary,
    clueCards,
    expandedAward,
    examinedAwards,
    setSelectedFilmId,
    loadFilm,
    changeDifficulty,
    examineAward,
    reveal,
    challengeFriend,
  };
}

function getNextScore(score: SessionScore, correct: boolean): SessionScore {
  return {
    correct: score.correct + (correct ? 1 : 0),
    total: score.total + 1,
  };
}
