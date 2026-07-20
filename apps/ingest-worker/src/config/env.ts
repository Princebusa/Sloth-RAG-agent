import dotenv from "dotenv";

dotenv.config();

export function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set — check apps/ingest-worker/.env`);
  }

  return value;
}

export const config = {
  openAiApiKey: getRequiredEnv("OPENAI_API_KEY"),
  embeddingModel: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
  embeddingDimensions: Number(process.env.EMBEDDING_DIMENSIONS ?? 1536),
  chunkSize: Number(process.env.CHUNK_SIZE ?? 1000),
  chunkOverlap: Number(process.env.CHUNK_OVERLAP ?? 200),
};
