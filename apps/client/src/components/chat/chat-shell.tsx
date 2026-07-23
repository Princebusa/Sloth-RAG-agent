"use client";

import { useEffect, useState } from "react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import {
  DriveSyncDialog,
  type DriveSyncStatus,
} from "@/components/chat/drive-sync-dialog";

export type DriveSyncInfo = {
  hasSynced: boolean;
  inProgress: boolean;
  status: DriveSyncStatus;
  lastSyncedAt: string | null;
  errorMessage?: string | null;
};

type ChatShellProps = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  driveSync: DriveSyncInfo;
  children: React.ReactNode;
};

function promptStorageKey(userId: string) {
  return `sloth:drive-sync-prompt-seen:${userId}`;
}

export function ChatShell({ user, driveSync, children }: ChatShellProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [syncInfo, setSyncInfo] = useState<DriveSyncInfo>(driveSync);

  useEffect(() => {
    setSyncInfo(driveSync);
  }, [driveSync]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const seen = window.localStorage.getItem(promptStorageKey(user.id));
    if (!driveSync.hasSynced && !driveSync.inProgress && !seen) {
      setDialogOpen(true);
    }
  }, [driveSync.hasSynced, driveSync.inProgress, user.id]);

  function markPromptSeen() {
    window.localStorage.setItem(promptStorageKey(user.id), "1");
  }

  function handleDialogChange(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      markPromptSeen();
    }
  }

  function handleSyncQueued(info: {
    status: DriveSyncStatus;
    inProgress: boolean;
    hasSynced: boolean;
    lastSyncedAt: string | null;
    errorMessage: string | null;
  }) {
    markPromptSeen();
    setSyncInfo({
      hasSynced: info.hasSynced,
      inProgress: info.inProgress,
      status: info.status,
      lastSyncedAt: info.lastSyncedAt,
      errorMessage: info.errorMessage,
    });
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <ChatSidebar
        user={user}
        driveSync={syncInfo}
        onOpenSyncDialog={() => setDialogOpen(true)}
      />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>

      <DriveSyncDialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
        onSyncQueued={handleSyncQueued}
      />
    </div>
  );
}
