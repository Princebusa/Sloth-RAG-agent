import OpenAI from "openai";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not set");
  }

  const baseURL =
    process.env.OPENAI_BASE_URL ??
    (process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY
      ? "https://openrouter.ai/api/v1"
      : undefined);

  return new OpenAI({
    apiKey,
    baseURL,
  });
}

function getChatModel() {
  if (process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_CHAT_MODEL ?? "openai/gpt-4o-mini";
  }
  return process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";
}

export async function askAgent(input: {
  question: string;
  context: string;
}): Promise<string> {
  const client = getOpenAIClient();

  const systemPrompt = `You are Sloth, a helpful assistant that answers questions using the user's Google Drive files.

Rules:
- Use the CONTEXT below to answer.
- If the context is not enough, say you could not find that in their Drive.
- Keep answers clear and short.
- Mention source file names when useful.`;

  const userPrompt = `CONTEXT FROM GOOGLE DRIVE:
${input.context}

USER QUESTION:
${input.question}`;

  const response = await client.chat.completions.create({
    model: getChatModel(),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
  });

  const answer = response.choices[0]?.message?.content?.trim();

  if (!answer) {
    return "I could not generate an answer. Please try again.";
  }

  return answer;
}
