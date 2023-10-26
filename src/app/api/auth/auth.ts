import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next"
import type { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth"
import CognitoProvider from "next-auth/providers/cognito"
import { withAuth } from "next-auth/middleware"

// You'll need to import and pass this
// to `NextAuth` in `app/api/auth/[...nextauth]/route.ts`
export const config = {
    secret: process.env.NEXTAUTH_SECRET || '',
    providers: [
        CognitoProvider({
            clientId: process.env.COGNITO_CLIENT_ID || '',
            clientSecret: process.env.COGNITO_CLIENT_SECRET || '',
            issuer: process.env.COGNITO_ISSUER,
          })
    ],
    callbacks: {
        async jwt({token, user, account, profile, isNewUser}) {
          // Add role from the token to JWT storage (runs on sign-in)
          if (account && profile) {
            token.role = profile.role; // 'role' is coming from your JWT token
          }
          return token;
        },
        async session({session, token}) {
          // Add role to session (runs every session refresh)
          session.role = token.role; 
          return session;
        },
        async signIn({user, account, profile, email, credentials}) {
          return true;
        }
    },
    pages: {
        signIn: '/',
    },
        
} satisfies NextAuthOptions

// Use it in server contexts
export function auth(...args: [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]] | [NextApiRequest, NextApiResponse] | []) {
  return getServerSession(...args, config)
}
