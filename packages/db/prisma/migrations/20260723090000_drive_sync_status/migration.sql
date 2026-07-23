-- CreateEnum
CREATE TYPE "DriveSyncStatus" AS ENUM ('IDLE', 'QUEUED', 'RUNNING', 'FAILED');

-- AlterTable
ALTER TABLE "DriveSyncState" ADD COLUMN "status" "DriveSyncStatus" NOT NULL DEFAULT 'IDLE';
ALTER TABLE "DriveSyncState" ADD COLUMN "jobId" TEXT;
ALTER TABLE "DriveSyncState" ADD COLUMN "errorMessage" TEXT;
ALTER TABLE "DriveSyncState" ADD COLUMN "lastSyncedAt" TIMESTAMP(3);

-- Deduplicate accountId rows before unique index (keep newest)
DELETE FROM "DriveSyncState" a
USING "DriveSyncState" b
WHERE a."accountId" = b."accountId"
  AND a."createdAt" < b."createdAt";

-- CreateIndex
CREATE UNIQUE INDEX "DriveSyncState_accountId_key" ON "DriveSyncState"("accountId");
