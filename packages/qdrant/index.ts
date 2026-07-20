import dotenv from "dotenv";
import { QdrantClient } from "@qdrant/js-client-rest";

dotenv.config();

const url = process.env.QDRANT_URL ?? process.env.qdrant_url;
const apiKey = process.env.QDRANT_API_KEY ?? process.env.qdrant_api_key;

if (!url) {
  throw new Error(
    "QDRANT_URL is not set — check packages/qdrant/.env (or qdrant_url)",
  );
}

export const qdrant = new QdrantClient({
  url,
  apiKey,
});

/** Default Qdrant collection for Drive file chunk embeddings. */
export const DRIVE_CHUNKS_COLLECTION = "drive_chunks";

export { QdrantClient };
