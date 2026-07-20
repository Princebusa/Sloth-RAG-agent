-- CreateEnum
CREATE TYPE "EmbeddingProvider" AS ENUM ('OPENAI');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "googleAccountId" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriveSyncState" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "lastChangeId" BIGINT,
    "pageToken" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriveSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriveFile" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "webViewLink" TEXT,
    "sizeBytes" BIGINT,
    "trashed" BOOLEAN NOT NULL DEFAULT false,
    "createdTime" TIMESTAMP(3),
    "modifiedTime" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "extractedAt" TIMESTAMP(3),

    CONSTRAINT "DriveFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chunk" (
    "id" TEXT NOT NULL,
    "driveFileId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "charStart" INTEGER,
    "charEnd" INTEGER,
    "tokenCount" INTEGER,
    "text" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmbeddingRef" (
    "id" TEXT NOT NULL,
    "chunkId" TEXT NOT NULL,
    "qdrantCollection" TEXT NOT NULL,
    "vectorId" VARCHAR(128) NOT NULL,
    "provider" "EmbeddingProvider" NOT NULL,
    "model" TEXT NOT NULL,
    "dimensions" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmbeddingRef_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleAccountId_key" ON "User"("googleAccountId");

-- AddForeignKey
ALTER TABLE "DriveSyncState" ADD CONSTRAINT "DriveSyncState_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriveFile" ADD CONSTRAINT "DriveFile_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbeddingRef" ADD CONSTRAINT "EmbeddingRef_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "Chunk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
