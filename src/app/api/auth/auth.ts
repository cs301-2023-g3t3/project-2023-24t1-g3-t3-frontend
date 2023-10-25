import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next"
import type { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// You'll need to import and pass this
// to `NextAuth` in `app/api/auth/[...nextauth]/route.ts`
export const config = {
    secret: process.env.NEXTAUTH_SECRET || '',
    providers: [
        GoogleProvider(
                {
                    clientId: process.env.GOOGLE_CLIENT_ID || '',
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
                }
            ),
        ],
        
} satisfies NextAuthOptions

// Use it in server contexts
export function auth(...args: [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]] | [NextApiRequest, NextApiResponse] | []) {
  return getServerSession(...args, config)
}