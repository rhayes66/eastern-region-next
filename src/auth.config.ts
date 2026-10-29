import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config: NO database, bcrypt, or Node-only imports.
 * Used by middleware (Edge runtime) and spread into the full config in auth.ts.
 * The role is carried on the JWT, so route gating needs no DB call here.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [], // real providers are added in auth.ts (Node runtime)
  callbacks: {
    // Carry id/role from the user object (set at sign-in) onto the token.
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = (user as { id?: string }).id;
      }
      return token;
    },
    // Expose id/role on the session for server components and the client.
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
    // Route gating for the middleware matcher (Edge-safe, token-only).
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const role = (auth?.user as { role?: string } | undefined)?.role;
      const isLoggedIn = !!auth?.user;

      const isAdminArea = pathname.startsWith("/admin");
      const isProfileArea = pathname.startsWith("/profile");

      if (isAdminArea) return isLoggedIn && role === "Admin";
      if (isProfileArea) return isLoggedIn;
      return true;
    },
  },
} satisfies NextAuthConfig;
