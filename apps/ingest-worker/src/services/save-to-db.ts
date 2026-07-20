import { prisma } from "db";
import { DRIVE_CHUNKS_COLLECTION } from "qdrant";
import { config } from "../config/env";
import type { DriveFileItem } from "./google-drive";
import type { SavedChunkResult } from "./embed-and-store";

/** Save or update one Drive file row in Postgres. */
export async function saveDriveFile(input: {
  userId: string;
  file: DriveFileItem;
}) {
  const existingFile = await prisma.driveFile.findFirst({
    where: {
      accountId: input.userId,
      fileId: input.file.id,
    },
  });

  const fileData = {
    accountId: input.userId,
    fileId: input.file.id,
    name: input.file.name,
    mimeType: input.file.mimeType,
    webViewLink: input.file.webViewLink ?? null,
    sizeBytes: input.file.size ? BigInt(input.file.size) : null,
    trashed: false,
    createdTime: input.file.createdTime
      ? new Date(input.file.createdTime)
      : null,
    modifiedTime: input.file.modifiedTime
      ? new Date(input.file.modifiedTime)
      : null,
    lastSyncedAt: new Date(),
    extractedAt: new Date(),
  };

  if (existingFile) {
    return prisma.driveFile.update({
      where: { id: existingFile.id },
      data: fileData,
    });
  }

  return prisma.driveFile.create({
    data: fileData,
  });
}

/** Save chunk rows and their Qdrant references in Postgres. */
export async function saveChunksAndEmbeddingRefs(input: {
  driveFileId: string;
  savedChunks: SavedChunkResult[];
}) {
  for (const savedChunk of input.savedChunks) {
    const chunk = await prisma.chunk.create({
      data: {
        driveFileId: input.driveFileId,
        chunkIndex: savedChunk.chunkIndex,
        text: savedChunk.text,
        contentHash: savedChunk.contentHash,
      },
    });

    await prisma.embeddingRef.create({
      data: {
        chunkId: chunk.id,
        qdrantCollection: DRIVE_CHUNKS_COLLECTION,
        vectorId: savedChunk.vectorId,
        provider: "OPENAI",
        model: config.embeddingModel,
        dimensions: config.embeddingDimensions,
      },
    });
  }
}
