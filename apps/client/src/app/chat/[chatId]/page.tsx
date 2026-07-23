import { auth } from "@/auth";
import { prisma } from "db";
import { notFound, redirect } from "next/navigation";
import { ChatThread } from "@/components/chat/chat-thread";

type ChatPageProps = {
  params: Promise<{ chatId: string }>;
};

export default async function SingleChatPage({ params }: ChatPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const { chatId } = await params;

  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  if (!chat) {
    notFound();
  }

  return (
    <ChatThread
      chatId={chat.id}
      title={chat.title}
      initialMessages={chat.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
      }))}
    />
  );
}
