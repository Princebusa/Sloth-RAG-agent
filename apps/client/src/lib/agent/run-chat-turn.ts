

import { prisma } from "db";
import { askAgent } from "./ask-agent";
import { formatContext, retrieveContext } from "./retrieve-context";

export async function runChatTurn(input: {
  userId: string;
  chatId: string;
  userMessage: string;
}) {
 
  const userMessage = await prisma.message.create({
    data: {
      chatId: input.chatId,
      role: "user",
      content: input.userMessage,
    },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
    },
  });

 
  let context = "No matching documents were found in the user's Google Drive.";
  let chunks: Awaited<ReturnType<typeof retrieveContext>> = [];

  try {
    chunks = await retrieveContext(input.userId, input.userMessage);
    context = formatContext(chunks);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Retrieve context error:", message);
    context =
      "Document search is temporarily unavailable. Answer without Drive context and say that retrieval failed.";
  }

 
  let answer: string;
  try {
    answer = await askAgent({
      question: input.userMessage,
      context,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Agent error:", message);
    answer =
      "Sorry — I had trouble answering just now. Please try again in a moment.";
  }

 
  const assistantMessage = await prisma.message.create({
    data: {
      chatId: input.chatId,
      role: "assistant",
      content: answer,
    },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
    },
  });

  await prisma.chat.update({
    where: { id: input.chatId },
    data: { updatedAt: new Date() },
  });

  return {
    userMessage,
    assistantMessage,
    sources: chunks.map((chunk) => chunk.fileName),
  };
}
