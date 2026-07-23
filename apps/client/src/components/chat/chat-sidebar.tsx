"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
  LogOut,
  MessageSquarePlus,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/logo";
import { MyDriveBox } from "@/components/chat/my-drive-box";
import { cn } from "@/lib/utils";

type ChatItem = {
  id: string;
  title: string;
  updatedAt: string;
};

type ChatSidebarProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  driveSync: {
    hasSynced: boolean;
    inProgress: boolean;
    status: "IDLE" | "QUEUED" | "RUNNING" | "FAILED";
    lastSyncedAt?: string | null;
    errorMessage?: string | null;
  };
  onOpenSyncDialog?: () => void;
};

export function ChatSidebar({
  user,
  driveSync,
  onOpenSyncDialog,
}: ChatSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const loadChats = useCallback(async () => {
    try {
      const res = await fetch("/api/chats");
      if (!res.ok) return;
      const data = (await res.json()) as { chats: ChatItem[] };
      setChats(data.chats ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChats();
  }, [loadChats, pathname]);

  if (collapsed) {
    return (
      <aside className="flex w-12 flex-col items-center border-r border-border bg-sidebar py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(false)}
          aria-label="Open sidebar"
        >
          <PanelLeft className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="mt-2"
          onClick={() => router.push("/chat")}
          aria-label="New chat"
        >
          <MessageSquarePlus className="size-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <Link href="/chat" className="flex min-w-0 items-center gap-2">
          <Logo />
          <span className="truncate text-sm font-semibold tracking-tight">
            Sloth
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed(true)}
          aria-label="Close sidebar"
        >
          <PanelLeftClose className="size-4" />
        </Button>
      </div>

      <div className="space-y-2 px-3 pb-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => router.push("/chat")}
        >
          <MessageSquarePlus className="size-4" />
          New chat
        </Button>

       
      </div>

      <Separator />

      <div className="px-3 pt-3 pb-1">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Chats
        </p>
      </div>

      <ScrollArea className="flex-1 px-2 pb-2">
        <div className="space-y-0.5">
          {loading ? (
            <p className="px-2 py-3 text-xs text-muted-foreground">Loading…</p>
          ) : chats.length === 0 ? (
            <p className="px-2 py-3 text-xs text-muted-foreground">
              No chats yet
            </p>
          ) : (
            chats.map((chat) => {
              const active = pathname === `/chat/${chat.id}`;
              return (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className={cn(
                    "block truncate rounded-lg px-2.5 py-2 text-sm transition",
                    active
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground",
                  )}
                >
                  {chat.title}
                </Link>
              );
            })
          )}
        </div>
      </ScrollArea>
        <MyDriveBox
          hasSynced={driveSync.hasSynced}
          inProgress={driveSync.inProgress}
          status={driveSync.status}
          lastSyncedAt={driveSync.lastSyncedAt}
          errorMessage={driveSync.errorMessage}
          onOpenSyncDialog={onOpenSyncDialog}
        />
      <Separator />
     

      <div className="flex items-center gap-2 px-3 py-3">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="size-7 rounded-full" />
        ) : (
          <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {(user.name ?? user.email ?? "U").slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">
            {user.name ?? "Signed in"}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {user.email}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => signOut({ callbackUrl: "/" })}
          aria-label="Sign out"
        >
          <LogOut className="size-3.5" />
        </Button>
      </div>
    </aside>
  );
}
