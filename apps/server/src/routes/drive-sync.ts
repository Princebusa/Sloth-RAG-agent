import { Router } from "express";
import { addDriveSyncJob } from "redis";
import { prisma } from "db";
import { authMiddleware } from "../Middleware/auth.middleware";
import { getValidGoogleAccessToken } from "../services/google-token";

const router = Router();

router.post("/sync", authMiddleware, async (req, res) => {
  const userId = req.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  try {
    const accessToken = await getValidGoogleAccessToken(userId);

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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    const status = message.includes("refresh token") ? 400 : 502;
    res.status(status).json({ error: message });
  }
});

export default router;
