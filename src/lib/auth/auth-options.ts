import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "./password";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || user.deletedAt || !user.password) return null;

        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Bloquer les utilisateurs supprimés (credentials uniquement — OAuth crée
      // le user via l'adapter avant d'appeler ce callback)
      if (account?.type === "credentials") {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (!dbUser || dbUser.deletedAt) return false;
      }
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      // Premier appel après sign-in : user est défini
      if (user) {
        token.id = user.id;
        token.organizationId = null;
        token.onboardingCompleted = false;

        // Pour OAuth, AdapterUser n'a pas `role` — relire depuis la DB
        if (account?.type === "oauth") {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
          });
          token.role = dbUser?.role ?? "USER";
        } else {
          token.role = (user as any).role ?? "USER";
        }
      }

      if (trigger === "signIn" || trigger === "signUp") {
        // Utiliser token.sub comme fallback : NextAuth le populate toujours
        const userId = (token.id ?? token.sub) as string | undefined;
        if (userId) {
          const membership = await prisma.organizationMember.findFirst({
            where: { userId, joinedAt: { not: null } },
            select: { organizationId: true },
          });
          if (membership) {
            token.organizationId = membership.organizationId;
            token.onboardingCompleted = true;
          }
        }
      }

      if (trigger === "update" && session) {
        if (session.organizationId !== undefined) {
          token.organizationId = session.organizationId;
        }
        if (session.onboardingCompleted !== undefined) {
          token.onboardingCompleted = session.onboardingCompleted;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string | null;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
      }
      return session;
    },
  },
};
