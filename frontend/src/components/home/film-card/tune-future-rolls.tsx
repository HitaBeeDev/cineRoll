import { useState } from "react";
import { Bookmark, Eye, EyeOff, Loader2, Moon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { AUTH_GATE_TITLE } from "@/hooks/useFilmActions";
import { QuickActionButton } from "@/components/home/film-card/quick-action-button";

/**
 * The three signals that record something and leave the film on screen. "Not
 * tonight" is not one of them: rolling away from a film is how its weak,
 * decaying penalty gets applied (see `processOutgoingRoll`), so that button has
 * nothing to confirm and nothing to stay for.
 */
type Signal = "seen" | "not-interested" | "saved" | "unsaved";

/** What each signal changes, in the user's terms — not the field it writes. */
const SIGNAL_CONFIRMATION: Record<Signal, string> = {
  seen: "Marked as seen. It won't come up in future rolls.",
  "not-interested": "We'll recommend fewer films like this.",
  saved: "Added to your watchlist.",
  unsaved: "Removed from your watchlist.",
};

/**
 * The demoted feedback tier: four signals that each teach the roll differently,
 * presented as one group under one heading, plus the confirmation footnote and
 * the guest auth gate. Every signal is a ready-made callback; the only state
 * here is whether this card has recorded one.
 */
export function TuneFutureRolls({
  isAuthenticated,
  onNotTonight,
  onAlreadySeen,
  seenActive,
  onNotInterested,
  notInterestedActive,
  actionsPending,
  onSave,
  savedActive,
  savePending,
  authPrompt,
  onCloseAuthPrompt,
  callbackUrl,
  flush = false,
}: {
  isAuthenticated: boolean;
  onNotTonight: () => void;
  onAlreadySeen: () => void;
  seenActive: boolean;
  onNotInterested: () => void;
  notInterestedActive: boolean;
  actionsPending: boolean;
  onSave: () => void;
  savedActive: boolean;
  savePending: boolean;
  authPrompt: keyof typeof AUTH_GATE_TITLE | null;
  onCloseAuthPrompt: () => void;
  callbackUrl: string;
  /** Drops the top rule and its spacing — for a caller that already separates
   *  this tier by putting it in a column of its own. */
  flush?: boolean;
}) {
  // Which signal the user actually sent from THIS card — not a standing status.
  // Deliberately not derived from seenActive/savedActive: those hydrate from the
  // account on mount, so a film saved weeks ago would announce a save the user
  // did not just make. Guests never set it — their click opens the auth gate
  // and writes nothing.
  const [signalRecorded, setSignalRecorded] = useState<Signal | null>(null);
  const recordSignal = (signal: Signal, send: () => void) => () => {
    if (isAuthenticated) setSignalRecorded(signal);
    send();
  };

  // Chosen is not the same as stored, and the difference is a network call the
  // user cannot see. The button fills in the moment it is pressed (the state is
  // optimistic — a failed save rolls it back), so the line underneath is what
  // says which of the two has happened.
  const saving = actionsPending || savePending;

  return (
    <section className={cn(!flush && "mt-4 border-t border-[#17171f] pt-4")}>
      {/* One heading over all four, stating what the group is for rather than
          how it is stored. "Tune future rolls" beside "Account signal" split
          them along a line the engine cares about and the reader does not:
          already seen tunes the roll AND writes to the account, not interested
          does both too. The weights behind the four still differ; the interface
          no longer asks anyone to guess which side of the data model a button
          falls on. */}
      <h3 className="mb-2 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#888899]">
        Improve your recommendations
      </h3>
      {/* Four distinct signals, each teaching the roll differently:
          • Not tonight    — session-only weak skip (guest-friendly, no hide)
          • Already seen   — hide + 👍/👎 taste (strong-positive if liked)
          • Not interested — permanent hide + strong session penalty
          • Save for later — watchlist, strong-positive signal */}
      <div className="grid grid-cols-2 gap-2">
        <QuickActionButton
          tone="skip"
          active={false}
          onClick={onNotTonight}
          icon={<Moon className="h-4 w-4" aria-hidden />}
          label="Not tonight"
          activeLabel="Not tonight"
        />
        <QuickActionButton
          tone="confirm"
          active={seenActive}
          pending={actionsPending && seenActive}
          disabled={actionsPending}
          onClick={recordSignal("seen", onAlreadySeen)}
          icon={<Eye className="h-4 w-4" aria-hidden />}
          label="Already seen"
          activeLabel="Seen"
        />
        <QuickActionButton
          tone="dismiss"
          active={notInterestedActive}
          pending={actionsPending && notInterestedActive}
          disabled={actionsPending}
          onClick={recordSignal("not-interested", onNotInterested)}
          icon={<EyeOff className="h-4 w-4" aria-hidden />}
          label="Not interested"
          activeLabel="Hidden"
        />
        <QuickActionButton
          tone="save"
          active={savedActive}
          pending={savePending && savedActive}
          disabled={savePending}
          // The only one of the four that undoes itself, so it is the only one
          // whose confirmation depends on which way it just went.
          onClick={recordSignal(savedActive ? "unsaved" : "saved", onSave)}
          icon={<Bookmark className="h-4 w-4" fill={savedActive ? "currentColor" : "none"} aria-hidden />}
          label="Save for later"
          activeLabel="Saved"
        />
      </div>
      {/* Appears only after a signal is sent, and says what that signal will do
          rather than that a row in a table changed. Guests get no standing
          nudge — the red sign-in line appears in its place when they tap one of
          the three account actions. `aria-live` because the button they just
          pressed is where their attention is, not down here. */}
      {signalRecorded && (
        <p
          aria-live="polite"
          className="mt-2.5 flex items-center gap-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.14em] text-[#6c6c80]"
        >
          {saving ? (
            <Loader2 aria-hidden className="h-2.5 w-2.5 animate-spin text-[#6c6c80]" />
          ) : (
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#3fb950]" />
          )}
          {saving ? "Saving…" : SIGNAL_CONFIRMATION[signalRecorded]}
        </p>
      )}

      {/* Guest auth gate: tapping Seen it / Save raises the sign-in modal; the
          action is stashed and replayed when the user returns. */}
      <AuthDialog
        open={authPrompt !== null}
        onOpenChange={(open) => {
          if (!open) onCloseAuthPrompt();
        }}
        callbackUrl={callbackUrl}
        title={authPrompt ? AUTH_GATE_TITLE[authPrompt] : undefined}
      />
    </section>
  );
}
