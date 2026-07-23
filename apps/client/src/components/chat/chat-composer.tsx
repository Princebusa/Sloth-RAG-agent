"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatComposerProps = {
  mode: "new" | "existing";
  chatId?: string;
  onMessageSent?: () => void;
};

export function ChatComposer({ mode, chatId, onMessageSent }: ChatComposerProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit() {
    const message = value.trim();
    if (!message || sending) return;

    setSending(true);

    try {
      if (mode === "new") {
        const res = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Failed to create chat");
        }

        setValue("");
        router.push(`/chat/${data.chat.id}`);
        router.refresh();
        return;
      }

      if (!chatId) return;

      const res = await fetch(`/api/chats/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to send message");
      }

      setValue("");
      onMessageSent?.();
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-6">
      <div className="relative rounded-2xl border border-border bg-card shadow-sm">
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Sloth anything about your Drive…"
          disabled={sending}
          className="min-h-[56px] resize-none border-0 bg-transparent px-4 py-3.5 pr-14 shadow-none focus-visible:ring-0"
          rows={1}
        />
        <Button
          size="icon"
          className="absolute right-2.5 bottom-2.5 rounded-full"
          disabled={!value.trim() || sending}
          onClick={() => void handleSubmit()}
          aria-label="Send message"
        >
          <ArrowUp className="size-4" />
        </Button>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Press Enter to send · Shift + Enter for a new line
      </p>
    </div>
  );
}
