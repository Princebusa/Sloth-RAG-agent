import { auth } from "@/auth";
import { signApiToken } from "@/lib/api-token";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

export function getApiUrl(): string {
  if (!API_URL) {
    throw new Error("API_URL or NEXT_PUBLIC_API_URL is not set");
  }
  return API_URL.replace(/\/$/, "");
}

/** Authenticated headers for server-side calls to Express. */
export async function getApiAuthHeaders(): Promise<HeadersInit> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const token = await signApiToken(session.user.id);
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}
