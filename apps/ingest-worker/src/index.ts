import "./config/env";
import {
  ackDriveSyncJob,
  readDriveSyncJob,
  setupDriveSyncConsumerGroup,
} from "redis";
import { processSyncJob } from "./worker/process-sync-job";

const consumerName = `ingest-worker-${process.pid}`;

async function startWorker() {
  await setupDriveSyncConsumerGroup();

  console.log("Ingest worker started");
  console.log("Waiting for Drive sync jobs from Redis stream...");

  while (true) {
    const job = await readDriveSyncJob(consumerName);

    if (!job) {
      continue;
    }

    console.log("Received job:", job.messageId);

    try {
      await processSyncJob({
        userId: job.userId,
        accessToken: job.accessToken,
      });

      await ackDriveSyncJob(job.messageId);
      console.log("Job completed:", job.messageId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Job failed:", job.messageId, message);

      // Ack even on failure so one bad job does not block the worker forever.
      await ackDriveSyncJob(job.messageId);
    }
  }
}

startWorker().catch((error) => {
  console.error("Worker crashed:", error);
  process.exit(1);
});
