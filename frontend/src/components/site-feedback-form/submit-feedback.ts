const FEEDBACK_ENDPOINT = "/api/feedback";

export type FeedbackInput = {
  email?: string;
  body: string;
  /** Honeypot value — echoed back to the server as a spam signal. */
  website: string;
};

/**
 * Sends site feedback. Throws an `Error` whose message is safe to show the
 * user, distinguishing rate-limiting from a generic failure.
 */
export async function submitFeedback(input: FeedbackInput): Promise<void> {
  const response = await fetch(FEEDBACK_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { code?: string };
    throw new Error(
      data.code === "RATE_LIMITED"
        ? "Too many messages from this connection. Try again later."
        : "Your message could not be sent.",
    );
  }
}
