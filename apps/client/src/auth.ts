import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "db";

const googleScopes = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/drive.readonly",
].join(" ");

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: googleScopes,
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && account.providerAccountId) {
        const email =
          typeof profile?.email === "string"
            ? profile.email
            : typeof token.email === "string"
              ? token.email
              : undefined;
        const name =
          typeof profile?.name === "string"
            ? profile.name
            : typeof token.name === "string"
              ? token.name
              : undefined;
        const image =
          typeof (profile as { picture?: string } | undefined)?.picture ===
          "string"
            ? (profile as { picture: string }).picture
            : typeof token.picture === "string"
              ? token.picture
              : undefined;

        const user = await prisma.user.upsert({
          where: { googleAccountId: account.providerAccountId },
          create: {
            googleAccountId: account.providerAccountId,
            email,
            name,
            image,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            tokenExpiresAt: account.expires_at,
          },
          update: {
            email,
            name,
            image,
            accessToken: account.access_token,
            tokenExpiresAt: account.expires_at,
            ...(account.refresh_token
              ? { refreshToken: account.refresh_token }
              : {}),
          },
        });

        token.userId = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) ?? token.sub ?? "";
      }
      return session;
    },
  },
});
