import { API_URL, JSON_HEADERS } from "./constants";
import type {
  NaturalRollError,
  NaturalRollEvent,
  NaturalRollFilters,
  NaturalRollInterpreted,
  NaturalRollResult,
} from "./natural-roll-types";
import { readNdjson } from "./read-ndjson";

type NaturalRollState = {
  result: NaturalRollResult | null;
  error: NaturalRollError | null;
};

export async function fetchNaturalRoll(
  prompt: string,
  count = 4,
  onInterpreted?: (stage: NaturalRollInterpreted) => void,
): Promise<NaturalRollResult> {
  const response = await requestNaturalRoll(prompt, count);
  if (!response.ok || !response.body) throw await getResponseError(response);

  const state: NaturalRollState = { result: null, error: null };
  await readNdjson(response.body, (value) => {
    applyNaturalRollEvent(state, value as NaturalRollEvent, onInterpreted);
  });

  if (state.error) throw state.error;
  if (state.result) return state.result;
  throw createNaturalRollError("Natural roll returned no result", "EMPTY_STREAM");
}

function requestNaturalRoll(prompt: string, count: number): Promise<Response> {
  return fetch(`${API_URL}/api/natural-roll`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ prompt, count }),
  });
}

function applyNaturalRollEvent(
  state: NaturalRollState,
  event: NaturalRollEvent,
  onInterpreted?: (stage: NaturalRollInterpreted) => void,
): void {
  if (event.type === "interpreted") onInterpreted?.(toInterpreted(event));
  if (event.type === "result") state.result = toResult(event);
  if (event.type === "error") {
    state.error = createNaturalRollError(
      event.error ?? "Natural roll failed",
      event.code ?? "UNKNOWN",
      event.interpretedFilters,
    );
  }
}

function toInterpreted(event: NaturalRollInterpreted): NaturalRollInterpreted {
  return {
    interpretedFilters: event.interpretedFilters,
    relaxed: event.relaxed,
    total: event.total,
  };
}

function toResult(event: NaturalRollResult): NaturalRollResult {
  return {
    films: event.films,
    total: event.total,
    interpretedFilters: event.interpretedFilters,
    relaxed: event.relaxed,
  };
}

async function getResponseError(response: Response): Promise<NaturalRollError> {
  const body = (await response.json().catch(() => ({}))) as {
    code?: string;
    error?: string;
    interpretedFilters?: NaturalRollFilters;
  };
  return createNaturalRollError(
    body.error ?? "Natural roll failed",
    body.code ?? "UNKNOWN",
    body.interpretedFilters,
  );
}

function createNaturalRollError(
  message: string,
  code: string,
  interpretedFilters?: NaturalRollFilters,
): NaturalRollError {
  const error = Object.assign(new Error(message), { code }) as NaturalRollError;
  if (interpretedFilters) error.interpretedFilters = interpretedFilters;
  return error;
}
