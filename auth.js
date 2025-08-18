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

          // Get user with locationAccess in a single query
          const user = await User.findOne({ userid: credentials.userid })
            .select('_id name userid password role locationAccess')
            .lean();

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
            // Include locationAccess directly from the first query
            locationAccess: user.locationAccess || [],
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
        
        // Set location IDs based on role and provided locationAccess
        if (user.role === "superadmin") {
          token.locationIds = ["__all__"];
        } else {
          // Use the locationAccess we already fetched during authorization
          token.locationIds = user.locationAccess?.map(id => id.toString()) || [];
        }
      }
      return token;
    },
    async session({ session, token }) {
      // We'll make just one database call to get fresh user data
      try {
        await connectDB();
        // Get user with locationAccess in a single query
        const dbUser = await User.findById(token.id)
          .select('_id userid name role locationAccess')
          .lean();
        
        if (dbUser) {
          // Set basic user info
          session.user = {
            id: dbUser._id.toString(),
            userid: dbUser.userid,
            name: dbUser.name,
            role: dbUser.role,
          };
          
          // Add location access information
          if (dbUser.role === "superadmin") {
            // Superadmins have access to all locations
            session.user.hasAllLocationsAccess = true;
            session.user.locationIds = ["__all__"]; 
          } else {
            // For regular users and admins, include specific location IDs
            session.user.hasAllLocationsAccess = false;
            session.user.locationIds = dbUser.locationAccess?.map(id => id.toString()) || [];
          }
        } else {
          // Fallback to token data if user not found
          session.user = {
            ...session.user,
            locationIds: token.locationIds || [],
            hasAllLocationsAccess: token.role === "superadmin"
          };
        }
      } catch (error) {
        console.error("Error in session callback:", error);
        // Fallback to token data if there was an error
        session.user = {
          ...session.user,
          locationIds: token.locationIds || [],
          hasAllLocationsAccess: token.role === "superadmin"
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
