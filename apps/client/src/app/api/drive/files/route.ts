import { auth } from "@/auth";
import { prisma } from "db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const files = await prisma.driveFile.findMany({
    where: {
      accountId: userId,
      trashed: false,
    },
    orderBy: { lastSyncedAt: "desc" },
    select: {
      id: true,
      fileId: true,
      name: true,
      mimeType: true,
      webViewLink: true,
      sizeBytes: true,
      lastSyncedAt: true,
      extractedAt: true,
    },
  });

  return NextResponse.json({
    files: files.map((file) => ({
      id: file.id,
      fileId: file.fileId,
      name: file.name,
      mimeType: file.mimeType,
      webViewLink: file.webViewLink,
      sizeBytes: file.sizeBytes ? file.sizeBytes.toString() : null,
      lastSyncedAt: file.lastSyncedAt.toISOString(),
      extractedAt: file.extractedAt?.toISOString() ?? null,
    })),
  });
}
