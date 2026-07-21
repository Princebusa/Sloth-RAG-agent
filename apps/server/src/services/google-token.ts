import { prisma } from "db";

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
};

function getGoogleOAuthCredentials() {
  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET must be set");
  }

  return { clientId, clientSecret };
}


export async function getValidGoogleAccessToken(
  userId: string,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const expiresAtMs = user.tokenExpiresAt ? user.tokenExpiresAt * 1000 : 0;
  const stillValid = user.accessToken && expiresAtMs > Date.now() + 60_000;

  if (stillValid && user.accessToken) {
    return user.accessToken;
  }

  if (!user.refreshToken) {
    throw new Error(
      "Google refresh token missing — sign out and sign in with Google again (consent required)",
    );
  }

  const { clientId, clientSecret } = getGoogleOAuthCredentials();

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: user.refreshToken,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to refresh Google access token: ${body}`);
  }

  const data = (await response.json()) as GoogleTokenResponse;
  const tokenExpiresAt = Math.floor(Date.now() / 1000) + data.expires_in;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      accessToken: data.access_token,
      tokenExpiresAt,
    },
  });

  return data.access_token;
}
