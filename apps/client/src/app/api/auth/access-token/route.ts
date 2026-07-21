import { auth } from "@/auth";
import { signApiToken } from "@/lib/api-token";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await signApiToken(session.user.id);
  return Response.json({ token, userId: session.user.id });
}
