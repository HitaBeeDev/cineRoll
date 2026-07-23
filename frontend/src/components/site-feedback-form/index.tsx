"use client";

import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSiteFeedbackForm } from "./use-site-feedback-form";

export function SiteFeedbackForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    email,
    body,
    website,
    isSending,
    remaining,
    canSend,
    setEmail,
    setBody,
    setWebsite,
    submit,
  } = useSiteFeedbackForm(onSuccess);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="grid gap-3"
    >
      <input
        type="text"
        name="website"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden="true"
      />
      <label className="sr-only" htmlFor="feedback-email">
        Email
      </label>
      <input
        id="feedback-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email optional"
        className="h-11 w-full border border-[#242438] bg-[#080810] px-4 text-sm text-[#f4f4f5] outline-none transition-colors placeholder:text-[#606078] focus:border-[#e8453c]/60 focus:ring-1 focus:ring-[#e8453c]/50"
      />
      <div>
        <label className="sr-only" htmlFor="feedback-message">
          Message
        </label>
        <textarea
          id="feedback-message"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="What should CineRoll improve?"
          rows={3}
          className="min-h-11 w-full resize-y border border-[#242438] bg-[#080810] px-4 py-3 text-sm leading-6 text-[#f4f4f5] outline-none transition-colors placeholder:text-[#606078] focus:border-[#e8453c]/60 focus:ring-1 focus:ring-[#e8453c]/50"
        />
        <p
          className={cn(
            "mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.24em]",
            remaining < 120 ? "text-[#e8453c]" : "text-[#666680]",
          )}
        >
          {remaining}
        </p>
      </div>
      <Button
        type="submit"
        size="md"
        disabled={!canSend}
        className="h-11 rounded-none bg-[#e8453c] px-5 text-white hover:bg-[#d93d35]"
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Send className="h-4 w-4" aria-hidden />
        )}
        Send
      </Button>
    </form>
  );
}
