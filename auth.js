import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "./lib/validation";
import { client } from "./sanity/lib/client";
import { USER_SIGNIN_QUERY } from "./sanity/lib/queries";

export const { signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          // Validate credentials using Zod schema
          const { email, password } =
            await signInSchema.parseAsync(credentials);

          // Fetch the user from Sanity
          const user = await client
            .withConfig({ useCdn: false })
            .fetch(USER_SIGNIN_QUERY, { email });

          // Check if the user exists
          if (!user) {
            throw new Error("No user found with this email.");
          }

          // Verify the password
          const isPasswordValid = user.password === password;
          if (!isPasswordValid) {
            throw new Error("Invalid password.");
          }

          return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null; 
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role,
      };
      return session;
    },
  },
});
