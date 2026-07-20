import { Router } from "express";
import { addDriveSyncJob } from "redis";
import { prisma } from "db";

const router = Router();

type SyncRequestBody = {
  userId?: string;
  accessToken?: string;
};

router.post("/sync", async (req, res) => {
  const body = req.body as SyncRequestBody;

  const userId = body.userId?.trim();
  const accessToken = body.accessToken?.trim();

  if (!userId) {
    res.status(400).json({ error: "userId is required" });
    return;
  }

  if (!accessToken) {
    res.status(400).json({ error: "accessToken is required" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const jobId = await addDriveSyncJob({
    userId,
    accessToken,
  });

  res.json({
    ok: true,
    message: "Drive sync job added to queue",
    jobId,
    userId,
  });
});

export default router;
