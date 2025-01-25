import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "./lib/validation";
import { client } from "./sanity/lib/client";
import { USER_SIGNIN_QUERY } from "./sanity/lib/queries";
import { z } from "zod";

export const { handlers, signIn, signOut, auth, } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    Credentials({
      credentials: {
        userid: { label: "User Id" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          // Validate credentials using Zod schema
          const { userid, password } =
            await signInSchema.parseAsync(credentials);

          // Fetch the user from Sanity
          const user = await client
            .withConfig({ useCdn: false })
            .fetch(USER_SIGNIN_QUERY, { userid });

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
            userid: user.userid,
            role: user.role,
          };
        } catch (error) {
          // console.error("Authorization error:", error);
          throw new CredentialsSignin(error.message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.userid = user.userid;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        userid: token.userid,
        name: token.name,
        role: token.role,
      };
      session.id = token.id;
      return session;
    },
  },
});
