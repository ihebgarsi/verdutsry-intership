import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginWithApi } from "@/lib/api";
import { findMockUser } from "@/lib/mock-users";
import type { Role } from "@/lib/roles";
import { ROLES } from "@/lib/roles";

function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        // Prefer backend authentication when available
        const apiResult = await loginWithApi(email, password);
        if (apiResult) {
          const role = apiResult.user.role;
          if (!isRole(role)) return null;
          return {
            id: apiResult.user.id,
            email: apiResult.user.email,
            name: apiResult.user.name,
            role,
            accessToken: apiResult.access_token,
          };
        }

        // Local demo accounts (offline fallback)
        const mock = findMockUser(email, password);
        if (!mock) return null;
        return {
          id: mock.id,
          email: mock.email,
          name: mock.name,
          role: mock.role,
          accessToken: "mock-token",
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
  trustHost: true,
});
