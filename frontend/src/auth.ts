import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";
import { sendVerificationCode } from "@/lib/email";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Resend({
      apiKey: process.env["RESEND_API_KEY"]!,
      from: process.env["EMAIL_FROM"] ?? "onboarding@resend.dev",
      generateVerificationToken: () =>
        String(Math.floor(100_000 + Math.random() * 900_000)),
      sendVerificationRequest: async ({ identifier, token }) => {
        await sendVerificationCode(identifier, token);
      },
    }),
    Google({
      clientId: process.env["AUTH_GOOGLE_ID"]!,
      clientSecret: process.env["AUTH_GOOGLE_SECRET"]!,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
