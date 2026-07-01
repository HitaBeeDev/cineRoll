import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Credentials sign-in requires JWT sessions (the adapter can't persist a
  // server session for a stateless credential check).
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.toLowerCase().trim()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        // No password set means the account is Google-only — reject rather than
        // leak that distinction; the UI nudges OAuth users toward Google.
        if (!user?.passwordHash) return null;

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    Google({
      clientId: process.env["AUTH_GOOGLE_ID"]!,
      clientSecret: process.env["AUTH_GOOGLE_SECRET"]!,
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.sub = user.id;
        token.picture = user.image ?? null;
      }
      // `update({ image })` from the settings avatar picker flows through here so
      // the new avatar is reflected without a full re-login.
      if (trigger === "update") {
        const next = (session as { image?: unknown } | undefined)?.image;
        if (typeof next === "string") token.picture = next;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      session.user.image = typeof token.picture === "string" ? token.picture : null;
      return session;
    },
  },
});
