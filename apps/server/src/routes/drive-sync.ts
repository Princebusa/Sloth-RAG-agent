import { Router } from "express";
import { addDriveSyncJob } from "redis";
import { prisma } from "db";
import { authMiddleware } from "../Middleware/auth.middleware";
import { getValidGoogleAccessToken } from "../services/google-token";

const router = Router();

router.get("/sync-status", authMiddleware, async (req, res) => {
  const userId = req.userId;

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

  res.json({
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
});

router.post("/sync", authMiddleware, async (req, res) => {
  const userId = req.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const existing = await prisma.driveSyncState.findUnique({
    where: { accountId: userId },
  });

  if (
    existing &&
    (existing.status === "QUEUED" || existing.status === "RUNNING")
  ) {
    res.status(409).json({
      error: "Drive sync is already in progress",
      status: existing.status,
      jobId: existing.jobId,
    });
    return;
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

    res.json({
      ok: true,
      message: "Drive sync job added to queue",
      jobId,
      userId,
      status: "QUEUED",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    const status = message.includes("refresh token") ? 400 : 502;
    res.status(status).json({ error: message });
  }
});

export default router;
