import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@test.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const rows = await sql`
          SELECT "id", "email", "passwordHash", "role"
          FROM "User"
          WHERE "email" = ${credentials.email}
          LIMIT 1
        `;

        if (rows.length === 0) return null;

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).id = token.id;
        (session.user as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev_mode_only",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
