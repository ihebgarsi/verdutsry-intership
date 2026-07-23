import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ApiError, loginWithApi } from "@/lib/api";
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

        try {
          const apiResult = await loginWithApi(email, password);
          const role = apiResult.user.role;
          if (!isRole(role)) return null;

          return {
            id: String(apiResult.user.id),
            email: apiResult.user.email,
            name: apiResult.user.name,
            role,
            companyId: apiResult.user.companyId,
            accessToken: apiResult.access_token,
          };
        } catch (error) {
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            return null;
          }
          // Backend down / network — surface as failed login
          return null;
        }
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
        token.companyId = user.companyId;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.companyId = token.companyId as string | undefined;
      }
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
  trustHost: true,
});
