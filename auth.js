import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "./lib/mongodb";
import User from "./models/User";
const { getUSEasternTime } = require("./lib/utils");

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        userid: { label: "User ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await connectDB();

          const user = await User.findOne({ userid: credentials.userid });

          if (!user) {
            return null;
          }

          // Direct password comparison since passwords are stored as plain text
          const isPasswordValid = credentials.password === user.password;
          if (!isPasswordValid) {
            return null;
          }

          // Update last login with US Eastern Time
          await User.findByIdAndUpdate(user._id, { lastLogin: getUSEasternTime() });

          return {
            id: user._id.toString(),
            name: user.name,
            userid: user.userid,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
    updateAge: 15 * 60, // refresh every 15 min
  },
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
      await connectDB();
      const dbUser = await User.findById(token.id);
      if (dbUser) {
        session.user = {
          id: dbUser._id.toString(),
          userid: dbUser.userid,
          name: dbUser.name,
          role: dbUser.role, // latest role
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export const { auth, signIn, signOut } = handler;
export { handler as GET, handler as POST };
