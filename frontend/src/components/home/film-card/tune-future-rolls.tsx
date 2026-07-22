import { Bookmark, Eye, EyeOff, Moon } from "lucide-react";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { AUTH_GATE_TITLE } from "@/hooks/useFilmActions";
import { QuickActionButton } from "@/components/home/film-card/quick-action-button";

/**
 * The demoted "Tune future rolls" maintenance tier: four distinct signals that
 * each teach the roll differently, plus the signed-in footnote and the guest
 * auth gate. Purely presentational — every signal is a ready-made callback.
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
}) {
  return (
    <section className="mt-4 border-t border-[#17171f] pt-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#888899]">
          Tune future rolls
        </h3>
        <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#5a5a6a]">
          {isAuthenticated ? "Account signal" : "Session signal"}
        </span>
      </div>
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
          disabled={actionsPending}
          onClick={onAlreadySeen}
          icon={<Eye className="h-4 w-4" aria-hidden />}
          label="Already seen"
          activeLabel="Seen"
        />
        <QuickActionButton
          tone="dismiss"
          active={notInterestedActive}
          disabled={actionsPending}
          onClick={onNotInterested}
          icon={<EyeOff className="h-4 w-4" aria-hidden />}
          label="Not interested"
          activeLabel="Hidden"
        />
        <QuickActionButton
          tone="save"
          active={savedActive}
          disabled={savePending}
          onClick={onSave}
          icon={<Bookmark className="h-4 w-4" fill={savedActive ? "currentColor" : "none"} aria-hidden />}
          label="Save for later"
          activeLabel="Saved"
        />
      </div>
      {/* Signed-in status footnote only. Guests get no standing nudge — the red
          sign-in line appears in its place when they tap an action. */}
      {isAuthenticated && (
        <p className="mt-2.5 flex items-center gap-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.14em] text-[#6c6c80]">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#3fb950]" />
          Saved to your account
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
