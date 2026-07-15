import type { RefObject } from "react";
import type {
  NaturalRollFilters,
  NaturalRollInterpreted,
  NaturalRollResult,
} from "@/lib/api";

export type NaturalRollController = {
  error: string | null;
  hasOutcome: boolean;
  interpreted: NaturalRollInterpreted | null;
  isProcessing: boolean;
  noMatchFilters: NaturalRollFilters | null;
  prompt: string;
  result: NaturalRollResult | null;
  statusMessage: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  reset: () => void;
  setPrompt: (prompt: string) => void;
  submit: () => Promise<void>;
};
