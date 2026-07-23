import { auth } from "@/auth";
import { runChatTurn } from "@/lib/agent/run-chat-turn";
import { prisma } from "db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chats = await prisma.chat.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ chats });
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { message?: string };

  try {
    body = (await request.json()) as { message?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const title =
    message.length > 48 ? `${message.slice(0, 48).trim()}…` : message;

  // Create empty chat first (agent loop will save the user + assistant messages)
  const chat = await prisma.chat.create({
    data: {
      userId,
      title,
    },
    select: {
      id: true,
      title: true,
    },
  });

  await runChatTurn({
    userId,
    chatId: chat.id,
    userMessage: message,
  });

  return NextResponse.json({ chat }, { status: 201 });
}
