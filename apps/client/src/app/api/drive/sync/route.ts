import { auth } from "@/auth";
import { getValidGoogleAccessToken } from "@/lib/google-token";
import { prisma } from "db";
import { addDriveSyncJob } from "redis";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const syncState = await prisma.driveSyncState.findUnique({
    where: { accountId: userId },
  });

  const latestFile = await prisma.driveFile.findFirst({
    where: { accountId: userId },
    orderBy: { lastSyncedAt: "desc" },
    select: { lastSyncedAt: true },
  });

  const status = syncState?.status ?? "IDLE";
  const inProgress = status === "QUEUED" || status === "RUNNING";

  return NextResponse.json({
    status,
    inProgress,
    hasSynced: Boolean(latestFile) || Boolean(syncState?.lastSyncedAt),
    lastSyncedAt:
      syncState?.lastSyncedAt?.toISOString() ??
      latestFile?.lastSyncedAt?.toISOString() ??
      null,
    errorMessage: syncState?.errorMessage ?? null,
    jobId: syncState?.jobId ?? null,
  });
}

export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existing = await prisma.driveSyncState.findUnique({
    where: { accountId: userId },
  });

  if (
    existing &&
    (existing.status === "QUEUED" || existing.status === "RUNNING")
  ) {
    return NextResponse.json(
      {
        error: "Drive sync is already in progress",
        status: existing.status,
        jobId: existing.jobId,
      },
      { status: 409 },
    );
  }

  try {
    const accessToken = await getValidGoogleAccessToken(userId);

    const jobId = await addDriveSyncJob({
      userId,
      accessToken,
    });

    await prisma.driveSyncState.upsert({
      where: { accountId: userId },
      create: {
        accountId: userId,
        status: "QUEUED",
        jobId,
        errorMessage: null,
      },
      update: {
        status: "QUEUED",
        jobId,
        errorMessage: null,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Drive sync job added to queue",
      jobId,
      userId,
      status: "QUEUED",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    const status = message.includes("refresh token") ? 400 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
