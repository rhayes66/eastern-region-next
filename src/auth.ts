import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validation";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        await dbConnect();
        // password has select:false → ask for it explicitly
        const user = await User.findOne({ email }).select("+password");
        if (!user || !user.password) return null;

        const ok = await user.comparePassword(password);
        if (!ok) return null;

        // Pending applicants may authenticate but are gated by role in middleware
        return {
          id: user._id.toString(),
          email: user.email,
          name: [user.firstname, user.lastname].filter(Boolean).join(" ") || user.email,
          role: user.role,
          picture: user.picture,
        };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    // Link/create a local User record for Google sign-ins (requirement 9)
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;
      await dbConnect();
      const email = user.email ?? profile?.email;
      if (!email) return false;

      let dbUser = await User.findOne({ email });
      if (!dbUser) {
        dbUser = await User.create({
          email,
          google: account.providerAccountId,
          firstname: (profile?.given_name as string) ?? "",
          lastname: (profile?.family_name as string) ?? "",
          picture: (profile?.picture as string) ?? "",
          role: "Pending", // new Google users start as Pending until admin accepts
        });
      } else if (!dbUser.google) {
        dbUser.google = account.providerAccountId;
        await dbUser.save();
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = (user as { id?: string }).id;
      }
      // Always refresh role from DB on Google sign-in (user obj lacks it there)
      if (!token.role && token.email) {
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser._id.toString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
