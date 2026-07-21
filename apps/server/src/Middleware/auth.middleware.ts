import { jwtVerify } from "jose";
import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}


export async function verifyApiToken(
  token: string,
) {
  const { payload } = await jwtVerify(token, getAuthSecret());
  const userId = payload.userId;

  if (typeof userId !== "string" || !userId) {
    throw new Error("Invalid token payload");
  }

  return { userId };
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const { userId } = await verifyApiToken(token);
    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};
