import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next"
import type { NextAuthOptions, Profile, Session } from "next-auth"
import { getServerSession } from "next-auth"
import CognitoProvider from "next-auth/providers/cognito"
import { withAuth } from "next-auth/middleware"

interface CustomProfile extends Profile {
  user_id: string;
  name: string;
  email: string;
  image: string;
  role: string;
}

interface CustomSession extends Session {
  role: string;
  userId: string;
  accessToken: string;
  id_token: string;
}

interface CustomAccount {
  access_token: string;
  id_token: string;
}

// You'll need to import and pass this
// to `NextAuth` in `app/api/auth/[...nextauth]/route.ts`
export const config = {
    secret: process.env.NEXTAUTH_SECRET || '',
    providers: [
        CognitoProvider({
            clientId: process.env.COGNITO_CLIENT_ID || '',
            clientSecret: process.env.COGNITO_CLIENT_SECRET || '',
            issuer: process.env.COGNITO_ISSUER,
            authorization: {
                params: {
                    scope: 'aws.cognito.signin.user.admin openid profile email',
                },
            },
            checks: "nonce"
          })
    ],
    callbacks: {
        async jwt({token, user, account, profile}) {
          console.log('jwt', token, user, account, profile)
          const customProfile = profile as CustomProfile;
          const customAccount = account as CustomAccount;
          
          // Add role from the token to JWT storage (runs on sign-in)
          if (account && profile) {
            token.role = customProfile.role; // 'role' is coming from your JWT token
            token.userId = customProfile.user_id;
            token.accessToken = customAccount.access_token;
            token.id_token = customAccount.id_token;
          }
          return token;
        },
        async session({session, token}) {
          // Add role to session (runs every session refresh)
          const customSession = session as CustomSession;
          customSession.role = token.role as string;
          customSession.userId = token.userId as string;
          customSession.accessToken = token.accessToken as string;
          customSession.id_token = token.id_token as string;
          return customSession;
        },
        async signIn({user, account, profile, email, credentials}) {
          return true;
        }
    },
    pages: {
        signIn: '/',
        signOut: '/',
    },
    debug: true,
        
} satisfies NextAuthOptions

// Use it in server contexts
export function auth(...args: [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]] | [NextApiRequest, NextApiResponse] | []) {
  return getServerSession(...args, config)
}
