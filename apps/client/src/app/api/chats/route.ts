import { auth } from "@/auth";
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

  const chat = await prisma.chat.create({
    data: {
      userId,
      title,
      messages: {
        create: {
          role: "user",
          content: message,
        },
      },
    },
    select: {
      id: true,
      title: true,
    },
  });

  return NextResponse.json({ chat }, { status: 201 });
}
