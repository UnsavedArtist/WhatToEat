import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

const isLocalTesting = process.env.NEXT_PUBLIC_IS_LOCAL_TESTING === 'true';
const baseUrl = isLocalTesting ? 'http://localhost:3000' : 'https://www.what2eat.pro';

const handler = NextAuth({
  debug: true, // Enable debug mode to see what's happening
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('Sign in callback:', { user, account, profile });
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', { url, baseUrl });
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async session({ session, token }) {
      console.log('Session callback:', { session, token });
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      console.log('JWT callback:', { token, user, account });
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('Sign in success:', { user, account, isNewUser });
    },
    async signOut({ session, token }) {
      console.log('Sign out success:', { session, token });
    },
  },
});

export { handler as GET, handler as POST }; 