import { auth } from "@/auth";
import { prisma } from "db";
import { redirect } from "next/navigation";
import { ChatShell } from "@/components/chat/chat-shell";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const [latestDriveFile, syncState] = await Promise.all([
    prisma.driveFile.findFirst({
      where: { accountId: userId },
      orderBy: { lastSyncedAt: "desc" },
      select: { lastSyncedAt: true },
    }),
    prisma.driveSyncState.findUnique({
      where: { accountId: userId },
      select: {
        status: true,
        lastSyncedAt: true,
        errorMessage: true,
      },
    }),
  ]);

  const status = syncState?.status ?? "IDLE";
  const inProgress = status === "QUEUED" || status === "RUNNING";
  const hasSynced =
    Boolean(latestDriveFile) || Boolean(syncState?.lastSyncedAt);

  return (
    <ChatShell
      user={{
        id: userId,
        name: session.user?.name,
        email: session.user?.email,
        image: session.user?.image,
      }}
      driveSync={{
        hasSynced,
        inProgress,
        status,
        lastSyncedAt:
          syncState?.lastSyncedAt?.toISOString() ??
          latestDriveFile?.lastSyncedAt?.toISOString() ??
          null,
        errorMessage: syncState?.errorMessage ?? null,
      }}
    >
      {children}
    </ChatShell>
  );
}
