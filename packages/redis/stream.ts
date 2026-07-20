import { redisStream } from "./client";

/** Redis stream name for Google Drive sync jobs. */
export const DRIVE_SYNC_STREAM = "drive:sync";

/** Consumer group used by ingest workers. */
export const DRIVE_SYNC_GROUP = "ingest-workers";

export type DriveSyncJob = {
  messageId: string;
  userId: string;
  accessToken: string;
};


export async function addDriveSyncJob(input: {
  userId: string;
  accessToken: string;
}): Promise<string> {
  const messageId = await redisStream.xadd(
    DRIVE_SYNC_STREAM,
    "*",
    "userId",
    input.userId,
    "accessToken",
    input.accessToken,
  );

  if (!messageId) {
    throw new Error("Failed to add job to Redis stream");
  }

  return messageId;
}


export async function setupDriveSyncConsumerGroup(): Promise<void> {
  try {
    await redisStream.xgroup(
      "CREATE",
      DRIVE_SYNC_STREAM,
      DRIVE_SYNC_GROUP,
      "0",
      "MKSTREAM",
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // Group already exists — that is fine.
    if (message.includes("BUSYGROUP")) {
      return;
    }

    throw error;
  }
}


export async function readDriveSyncJob(
  consumerName: string,
) {
  const result = await redisStream.xreadgroup(
    "GROUP",
    DRIVE_SYNC_GROUP,
    consumerName,
    "COUNT",
    1,
    "BLOCK",
    5000,
    "STREAMS",
    DRIVE_SYNC_STREAM,
    ">",
  );

  if (!result) {
    return null;
  }

  const streamEntry = result[0] as [string, [string, string[]][]] | undefined;
  if (!streamEntry) {
    return null;
  }

  const messages = streamEntry[1];
  const firstMessage = messages[0];
  if (!firstMessage) {
    return null;
  }

  const [messageId, fields] = firstMessage;

  const data: Record<string, string> = {};
  for (let i = 0; i < fields.length; i += 2) {
    const key = fields[i];
    const value = fields[i + 1];
    if (key && value) {
      data[key] = value;
    }
  }

  const userId = data.userId;
  const accessToken = data.accessToken;

  if (!userId || !accessToken) {
    throw new Error("Invalid job data in Redis stream");
  }

  return {
    messageId,
    userId,
    accessToken,
  };
}


export async function ackDriveSyncJob(messageId: string): Promise<void> {
  await redisStream.xack(DRIVE_SYNC_STREAM, DRIVE_SYNC_GROUP, messageId);
}
