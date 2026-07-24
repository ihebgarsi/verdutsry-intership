import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { ApiError, loginWithApi, loginWithGoogleApi } from "@/lib/api";
import type { Role } from "@/lib/roles";
import { ROLES } from "@/lib/roles";

function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

const googleClientId =
  process.env.AUTH_GOOGLE_ID ?? process.env.CLIENT_ID ?? "";
const googleClientSecret =
  process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "";
const googleEnabled = Boolean(googleClientId && googleClientSecret);

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
            companyName: apiResult.user.companyName,
            accessToken: apiResult.access_token,
          };
        } catch (error) {
          if (
            error instanceof ApiError &&
            (error.status === 401 || error.status === 403)
          ) {
            return null;
          }
          return null;
        }
      },
    }),
    ...(googleEnabled
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Google → exchange Google ID token for FastAPI JWT + user profile
      if (account?.provider === "google" && account.id_token) {
        try {
          const apiResult = await loginWithGoogleApi(account.id_token);
          const role = apiResult.user.role;
          if (!isRole(role)) {
            throw new Error("Invalid role from backend");
          }
          token.id = String(apiResult.user.id);
          token.role = role;
          token.companyId = apiResult.user.companyId;
          token.companyName = apiResult.user.companyName;
          token.accessToken = apiResult.access_token;
          token.email = apiResult.user.email;
          token.name = apiResult.user.name;
        } catch (error) {
          const detail =
            error instanceof ApiError
              ? error.message
              : error instanceof Error
                ? error.message
                : "Google login failed against the API";
          throw new Error(detail);
        }
        return token;
      }

      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.companyId = user.companyId;
        token.companyName = user.companyName;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.companyId = token.companyId as string | undefined;
        session.user.companyName = token.companyName as string | undefined;
        if (token.email) session.user.email = token.email as string;
        if (token.name) session.user.name = token.name as string;
      }
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
  trustHost: true,
});
