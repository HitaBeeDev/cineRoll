"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { fetchNaturalRoll } from "@/lib/api";
import { PROMPT_MAX_LENGTH } from "./prompt-config";
import { getNaturalRollFailure } from "./get-natural-roll-error";
import { getNaturalRollStatus } from "./get-natural-roll-status";
import { trackNaturalRollResults } from "./natural-roll-analytics";
import type { NaturalRollController } from "./natural-roll-controller";
import type {
  NaturalRollFilters,
  NaturalRollInterpreted,
  NaturalRollResult,
} from "@/lib/api";

const NATURAL_ROLL_RESULT_COUNT = 6;

export function useNaturalRoll(): NaturalRollController {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPromptState] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<NaturalRollResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noMatchFilters, setNoMatchFilters] =
    useState<NaturalRollFilters | null>(null);
  const [interpreted, setInterpreted] =
    useState<NaturalRollInterpreted | null>(null);

  const setPrompt = useCallback((value: string) => {
    setPromptState(value.slice(0, PROMPT_MAX_LENGTH));
  }, []);

  const clearOutcome = useCallback(() => {
    setError(null);
    setResult(null);
    setNoMatchFilters(null);
    setInterpreted(null);
  }, []);

  const submit = useCallback(async () => {
    const submittedPrompt = prompt.trim();
    if (!submittedPrompt || isProcessing) return;

    setIsProcessing(true);
    clearOutcome();
    try {
      const nextResult = await fetchNaturalRoll(
        submittedPrompt,
        NATURAL_ROLL_RESULT_COUNT,
        setInterpreted,
      );
      setResult(nextResult);
      trackNaturalRollResults(nextResult, submittedPrompt.length);
    } catch (caughtError) {
      const failure = getNaturalRollFailure(caughtError);
      setError(failure.message);
      setNoMatchFilters(failure.noMatchFilters);
    } finally {
      setIsProcessing(false);
    }
  }, [clearOutcome, isProcessing, prompt]);

  const reset = useCallback(() => {
    setPromptState("");
    clearOutcome();
    window.setTimeout(() => textareaRef.current?.focus(), 80);
  }, [clearOutcome]);

  const statusMessage = useMemo(
    () =>
      getNaturalRollStatus({
        error,
        interpreted,
        isProcessing,
        noMatchFilters,
        result,
      }),
    [error, interpreted, isProcessing, noMatchFilters, result],
  );

  return {
    error,
    hasOutcome: Boolean(result || error || noMatchFilters),
    interpreted,
    isProcessing,
    noMatchFilters,
    prompt,
    result,
    statusMessage,
    textareaRef,
    reset,
    setPrompt,
    submit,
  };
}
