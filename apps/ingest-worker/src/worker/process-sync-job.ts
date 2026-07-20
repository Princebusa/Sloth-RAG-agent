import {
  downloadDriveFileText,
  isSupportedMimeType,
  listDriveFiles,
} from "../services/google-drive";
import {
  embedAndSaveToQdrant,
  splitTextIntoChunks,
} from "../services/embed-and-store";
import {
  saveChunksAndEmbeddingRefs,
  saveDriveFile,
} from "../services/save-to-db";

export type SyncJobInput = {
  userId: string;
  accessToken: string;
};

/** Process one Drive sync job from the Redis stream. */
export async function processSyncJob(job: SyncJobInput): Promise<void> {
  console.log("Starting sync for user:", job.userId);

  const files = await listDriveFiles(job.accessToken);
  console.log("Found files:", files.length);

  let processedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    if (!isSupportedMimeType(file.mimeType)) {
      console.log("Skipping unsupported file:", file.name, file.mimeType);
      skippedCount += 1;
      continue;
    }

    console.log("Processing file:", file.name);

    const text = await downloadDriveFileText(job.accessToken, file);

    if (!text || text.trim().length === 0) {
      console.log("Skipping empty file:", file.name);
      skippedCount += 1;
      continue;
    }

    const chunks = await splitTextIntoChunks(text);

    if (chunks.length === 0) {
      console.log("Skipping file with no chunks:", file.name);
      skippedCount += 1;
      continue;
    }

    const driveFile = await saveDriveFile({
      userId: job.userId,
      file,
    });

    const savedChunks = await embedAndSaveToQdrant({
      userId: job.userId,
      driveFileId: driveFile.id,
      fileName: file.name,
      mimeType: file.mimeType,
      chunks,
    });

    await saveChunksAndEmbeddingRefs({
      driveFileId: driveFile.id,
      savedChunks,
    });

    processedCount += 1;
    console.log("Finished file:", file.name, "| chunks:", savedChunks.length);
  }

  console.log(
    "Sync complete for user:",
    job.userId,
    "| processed:",
    processedCount,
    "| skipped:",
    skippedCount,
  );
}
