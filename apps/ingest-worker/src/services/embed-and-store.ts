import { createHash, randomUUID } from "node:crypto";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { config } from "../config/env";
import { DRIVE_CHUNKS_COLLECTION, qdrant } from "qdrant";

export function hashText(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

/** Split long text into smaller chunks for embedding. */
export async function splitTextIntoChunks(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: config.chunkSize,
    chunkOverlap: config.chunkOverlap,
  });

  return splitter.splitText(text);
}

function getEmbeddings() {
  return new OpenAIEmbeddings({
    apiKey: config.openAiApiKey,
    model: config.embeddingModel,
  });
}

/** Make sure the Qdrant collection exists before we save vectors. */
export async function ensureQdrantCollection(): Promise<void> {
  const collections = await qdrant.getCollections();
  const exists = collections.collections.some(
    (collection) => collection.name === DRIVE_CHUNKS_COLLECTION,
  );

  if (exists) {
    return;
  }

  await qdrant.createCollection(DRIVE_CHUNKS_COLLECTION, {
    vectors: {
      size: config.embeddingDimensions,
      distance: "Cosine",
    },
  });

  console.log("Created Qdrant collection:", DRIVE_CHUNKS_COLLECTION);
}

export type SavedChunkResult = {
  chunkIndex: number;
  text: string;
  contentHash: string;
  vectorId: string;
};

/**
 * 1. Create embeddings with LangChain
 * 2. Save vectors to Qdrant
 */
export async function embedAndSaveToQdrant(input: {
  userId: string;
  driveFileId: string;
  fileName: string;
  mimeType: string;
  chunks: string[];
}): Promise<SavedChunkResult[]> {
  await ensureQdrantCollection();

  const embeddings = getEmbeddings();
  const vectors = await embeddings.embedDocuments(input.chunks);

  const savedChunks: SavedChunkResult[] = [];

  for (let index = 0; index < input.chunks.length; index += 1) {
    const chunkText = input.chunks[index];
    const vector = vectors[index];
    const vectorId = randomUUID();

    if (!chunkText || !vector) {
      continue;
    }

    await qdrant.upsert(DRIVE_CHUNKS_COLLECTION, {
      wait: true,
      points: [
        {
          id: vectorId,
          vector,
          payload: {
            userId: input.userId,
            driveFileId: input.driveFileId,
            fileName: input.fileName,
            mimeType: input.mimeType,
            chunkIndex: index,
            text: chunkText,
          },
        },
      ],
    });

    savedChunks.push({
      chunkIndex: index,
      text: chunkText,
      contentHash: hashText(chunkText),
      vectorId,
    });
  }

  return savedChunks;
}
