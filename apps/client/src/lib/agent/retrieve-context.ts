import { OpenAIEmbeddings } from "@langchain/openai";
import { DRIVE_CHUNKS_COLLECTION, qdrant } from "qdrant";

export type RetrievedChunk = {
  text: string;
  fileName: string;
  score: number;
};

function getEmbeddingClient() {
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not set");
  }

  const baseURL =
    process.env.OPENAI_BASE_URL ??
    (process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY
      ? "https://openrouter.ai/api/v1"
      : undefined);

  return new OpenAIEmbeddings({
    apiKey,
    model: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
    configuration: baseURL ? { baseURL } : undefined,
  });
}


export async function retrieveContext(
  userId: string,
  question: string,
): Promise<RetrievedChunk[]> {
  const embeddings = getEmbeddingClient();
  const queryVector = await embeddings.embedQuery(question);

  const results = await qdrant.search(DRIVE_CHUNKS_COLLECTION, {
    vector: queryVector,
    limit: 5,
    with_payload: true,
    filter: {
      must: [
        {
          key: "userId",
          match: { value: userId },
        },
      ],
    },
  });

  const chunks: RetrievedChunk[] = [];

  for (const point of results) {
    const payload = point.payload ?? {};
    const text = typeof payload.text === "string" ? payload.text : "";
    const fileName =
      typeof payload.fileName === "string" ? payload.fileName : "Unknown file";

    if (!text) continue;

    chunks.push({
      text,
      fileName,
      score: point.score ?? 0,
    });
  }

  return chunks;
}


export function formatContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "No matching documents were found in the user's Google Drive.";
  }

  return chunks
    .map((chunk, index) => {
      return `[Source ${index + 1}: ${chunk.fileName}]\n${chunk.text}`;
    })
    .join("\n\n");
}
