import { Resend } from "resend";
import { config } from "../config";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendFeedbackNotification({
  email,
  body,
  feedbackId,
}: {
  email: string | null;
  body: string;
  feedbackId: string;
}): Promise<boolean> {
  if (!config.resendApiKey || !config.ownerEmail) {
    return false;
  }

  const resend = new Resend(config.resendApiKey);
  const sender = email ?? "anonymous";
  const { error } = await resend.emails.send({
    from: "CineRoll Feedback <onboarding@resend.dev>",
    to: config.ownerEmail,
    subject: "New CineRoll feedback",
    ...(email ? { replyTo: email } : {}),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#18181b">
        <h2 style="margin:0 0 12px">New CineRoll feedback</h2>
        <p style="margin:0 0 16px;color:#52525b">Feedback ID: ${escapeHtml(feedbackId)}</p>
        <p style="margin:0 0 16px;color:#52525b">From: ${escapeHtml(sender)}</p>
        <div style="white-space:pre-wrap;line-height:1.6;padding:16px;border:1px solid #e4e4e7;border-radius:8px;background:#fafafa">
          ${escapeHtml(body)}
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend failed to send feedback email: ${error.message}`);
  }

  return true;
}
