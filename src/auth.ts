import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./lib/prisma"
import Google from "next-auth/providers/google"
import Github from "next-auth/providers/github"
import { Adapter } from "next-auth/adapters"
import type { Provider } from "next-auth/providers"
import Nodemailer from "next-auth/providers/nodemailer"
import Credentials from "next-auth/providers/credentials"

const providers: Provider[] = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
    allowDangerousEmailAccountLinking: true,
  })
  ,Github({
    clientId: process.env.AUTH_GITHUB_ID,
    clientSecret: process.env.AUTH_GITHUB_SECRET,
    allowDangerousEmailAccountLinking: true,
  })
  ,Nodemailer({
    server: {
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    },
    from: process.env.EMAIL_FROM,
  }),
]
 
export const providerMap = providers.map((provider) => {
  if (typeof provider === "function") {
    const providerData = provider()
    return { id: providerData.id, name: providerData.name }
  } else {
    return { id: provider.id, name: provider.name }
  }
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  theme: {
    logo: "/logo.png",
  },
  adapter: PrismaAdapter(prisma) as Adapter,
  callbacks: {
    session({session, user}){
      session.user.role = user.role
      return session
    },
    async redirect() {
      // Redirect to home page after sign-in
      return "/";
    },
  },
  providers,
})