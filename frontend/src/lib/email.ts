import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (process.env.NODE_ENV !== "production") {
    // Dev aid: surface the reset link so the flow can be tested even when
    // Resend can't deliver (e.g. test mode / unverified domain).
    console.log(`[dev] password reset link for ${to}: ${resetUrl}`);
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your CineRoll password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="margin-bottom:8px">Reset your password</h2>
        <p style="color:#555;margin-bottom:24px">We received a request to reset your CineRoll password. This link expires in 30 minutes.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#e8453c;color:#fff;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:8px">Reset password</a>
        <p style="color:#999;font-size:13px;margin-top:24px">If you didn't request this, you can safely ignore this email — your password won't change.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend failed to send password reset email: ${error.message}`);
  }
}
