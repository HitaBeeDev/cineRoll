"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { submitFeedback } from "./submit-feedback";

const MAX_BODY_LENGTH = 2000;

/**
 * Form state + submission for site feedback: keeps the body within its limit,
 * carries a honeypot field, and toasts success/failure. `onSuccess` fires only
 * after the message is accepted (e.g. to close a dialog).
 */
export function useSiteFeedbackForm(onSuccess?: () => void) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [body, setBodyRaw] = useState("");
  const [website, setWebsite] = useState("");
  const [isSending, setIsSending] = useState(false);

  const remaining = MAX_BODY_LENGTH - body.length;
  const canSend = body.trim().length > 0 && !isSending;

  function setBody(value: string) {
    setBodyRaw(value.slice(0, MAX_BODY_LENGTH));
  }

  async function submit() {
    const trimmedBody = body.trim();
    if (!trimmedBody || isSending) return;

    const trimmedEmail = email.trim();
    setIsSending(true);
    try {
      await submitFeedback({
        ...(trimmedEmail ? { email: trimmedEmail } : {}),
        body: trimmedBody,
        website,
      });
      setEmail("");
      setBodyRaw("");
      setWebsite("");
      toast({ title: "Thanks for your feedback!" });
      onSuccess?.();
    } catch (error) {
      toast({
        variant: "error",
        title: "Couldn't send feedback",
        description: error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsSending(false);
    }
  }

  return {
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
  };
}
