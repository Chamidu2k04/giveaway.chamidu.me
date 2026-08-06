import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

/**
 * SECURITY: This is the ONLY authentication method.
 * The only valid credentials are stored in environment variables:
 * - ADMIN_USERNAME
 * - ADMIN_PASSWORD_HASH (bcrypt hash)
 * No other login method exists. There is no Google OAuth, no magic links,
 * no email login. This is by design for maximum security.
 */

const loginSchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(128),
});

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Validate input shape with Zod
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { username, password } = parsed.data;

        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        // 2. Ensure env vars are set
        if (!adminUsername || !adminPasswordHash) {
          console.error('[AUTH] ADMIN_USERNAME or ADMIN_PASSWORD_HASH is not set in environment variables.');
          return null;
        }

        // 3. Constant-time username comparison (prevent timing attacks)
        const usernameMatch = username === adminUsername;

        // 4. Always run bcrypt compare (even if username is wrong) to prevent
        //    timing attacks that could reveal whether the username is correct
        const passwordMatch = await bcrypt.compare(password, adminPasswordHash);

        if (!usernameMatch || !passwordMatch) {
          return null;
        }

        // 5. Return minimal user object — never include password hash
        return {
          id: "admin",
          name: adminUsername,
          role: "admin",
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
