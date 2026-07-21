import { Router } from "express";
import { prisma } from "db";
import { authMiddleware } from "../Middleware/auth.middleware";

const router = Router();

/** Return the authenticated user (Bearer API JWT from the Next.js BFF). */
router.get("/me", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      googleAccountId: true,
      createdAt: true,
    },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user });
});

export default router;
