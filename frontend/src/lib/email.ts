import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationCode(to: string, code: string) {
  if (process.env.NODE_ENV !== "production") {
    // Dev aid: surface the recipient + code so the email flow can be tested
    // even when Resend can't deliver (e.g. test mode / unverified domain).
    console.log(`[dev] verification code for ${to}: ${code}`);
  }

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
    to,
    subject: "Your CineRoll sign-in code",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="margin-bottom:8px">Your sign-in code</h2>
        <p style="color:#555;margin-bottom:24px">Enter this code to sign in to CineRoll. It expires in 10 minutes.</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:8px;text-align:center;padding:24px;background:#f4f4f5;border-radius:8px">
          ${code}
        </div>
        <p style="color:#999;font-size:13px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend failed to send verification email: ${error.message}`);
  }
}
