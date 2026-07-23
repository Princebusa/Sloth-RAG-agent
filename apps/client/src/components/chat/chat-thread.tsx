"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: string;
  content: string;
};

type ChatThreadProps = {
  chatId: string;
  title: string;
  initialMessages: ChatMessage[];
};

export function ChatThread({
  chatId,
  title,
  initialMessages,
}: ChatThreadProps) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [initialMessages.length]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center border-b border-border px-4">
        <h1 className="truncate text-sm font-medium">{title}</h1>
      </header>

      <ScrollArea className="flex-1">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
          {initialMessages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                className={cn("flex", isUser ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {message.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <ChatComposer
        mode="existing"
        chatId={chatId}
        onMessageSent={() => router.refresh()}
      />
    </div>
  );
}
