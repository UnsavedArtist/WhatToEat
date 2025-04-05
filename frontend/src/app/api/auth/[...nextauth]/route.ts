import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

const isDevelopment = process.env.NODE_ENV === 'development';
const baseUrl = isDevelopment ? 'http://localhost:3000' : 'https://www.what2eat.pro';

const handler = NextAuth({
  debug: isDevelopment, // Only enable debug in development
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (isDevelopment) {
        console.log('Sign in callback:', { user, account, profile });
      }
      if (!user?.email) {
        return false;
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (isDevelopment) {
        console.log('Redirect callback:', { url, baseUrl });
      }
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allow redirects to both development and production domains
      if (url.startsWith('http://localhost:3000') && isDevelopment) return url
      if (url.startsWith('https://www.what2eat.pro') && !isDevelopment) return url
      return baseUrl
    },
    async session({ session, token }) {
      if (isDevelopment) {
        console.log('Session callback:', { session, token });
      }
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (isDevelopment) {
        console.log('JWT callback:', { token, user, account });
      }
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
      if (isDevelopment) {
        console.log('Sign in success:', { user, account, isNewUser });
      }
    },
    async signOut({ session, token }) {
      if (isDevelopment) {
        console.log('Sign out success:', { session, token });
      }
    },
  },
});

export { handler as GET, handler as POST }; 