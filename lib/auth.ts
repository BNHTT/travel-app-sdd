import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const users = await sql`
            SELECT id, email, name, image, password_hash 
            FROM users 
            WHERE email = ${email}
          `;

          if (users.length === 0) {
            return null;
          }

          const user = users[0];
          
          if (!user.password_hash) {
            return null;
          }

          const isValid = await bcrypt.compare(password, user.password_hash);

          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existingUsers = await sql`
            SELECT id FROM users WHERE email = ${user.email}
          `;

          if (existingUsers.length === 0) {
            await sql`
              INSERT INTO users (id, email, name, image)
              VALUES (${crypto.randomUUID()}, ${user.email}, ${user.name}, ${user.image})
            `;
          } else {
            await sql`
              UPDATE users 
              SET name = ${user.name}, image = ${user.image}, updated_at = NOW()
              WHERE email = ${user.email}
            `;
          }
        } catch (error) {
          console.error("Error syncing user:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUsers = await sql`
          SELECT id FROM users WHERE email = ${user.email}
        `;
        if (dbUsers.length > 0) {
          token.userId = dbUsers[0].id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
