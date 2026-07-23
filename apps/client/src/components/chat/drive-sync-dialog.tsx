"use client";

import { useEffect, useState } from "react";
import { Cloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type DriveSyncStatus = "IDLE" | "QUEUED" | "RUNNING" | "FAILED";

type StatusPayload = {
  status: DriveSyncStatus;
  inProgress: boolean;
  hasSynced: boolean;
  lastSyncedAt: string | null;
  errorMessage: string | null;
};

type DriveSyncDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSyncQueued?: (info: StatusPayload) => void;
};

export function DriveSyncDialog({
  open,
  onOpenChange,
  onSyncQueued,
}: DriveSyncDialogProps) {
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusInfo, setStatusInfo] = useState<StatusPayload | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadStatus() {
      setLoadingStatus(true);
      setError(null);

      try {
        const res = await fetch("/api/drive/sync");
        const data = await res.json();

        if (!res.ok) {
          if (!cancelled) {
            setError(data.error ?? "Failed to check sync status");
          }
          return;
        }

        if (!cancelled) {
          setStatusInfo({
            status: (data.status as DriveSyncStatus) ?? "IDLE",
            inProgress: Boolean(data.inProgress),
            hasSynced: Boolean(data.hasSynced),
            lastSyncedAt: data.lastSyncedAt ?? null,
            errorMessage: data.errorMessage ?? null,
          });
        }
      } catch {
        if (!cancelled) {
          setError("Failed to check sync status");
        }
      } finally {
        if (!cancelled) {
          setLoadingStatus(false);
        }
      }
    }

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, [open]);

  async function handleStartSync() {
    if (starting || statusInfo?.inProgress) return;

    setStarting(true);
    setError(null);

    try {
      const res = await fetch("/api/drive/sync", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Sync failed");

        // If already in progress, refresh status from that response.
        if (res.status === 409) {
          setStatusInfo((prev) => ({
            status: (data.status as DriveSyncStatus) ?? "QUEUED",
            inProgress: true,
            hasSynced: prev?.hasSynced ?? false,
            lastSyncedAt: prev?.lastSyncedAt ?? null,
            errorMessage: null,
          }));
        }
        return;
      }

      const next: StatusPayload = {
        status: "QUEUED",
        inProgress: true,
        hasSynced: statusInfo?.hasSynced ?? false,
        lastSyncedAt: statusInfo?.lastSyncedAt ?? null,
        errorMessage: null,
      };

      setStatusInfo(next);
      onSyncQueued?.(next);
    } catch {
      setError("Could not start Drive sync. Try again.");
    } finally {
      setStarting(false);
    }
  }

  const inProgress = Boolean(statusInfo?.inProgress);
  const busy = loadingStatus || starting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex size-10 items-center justify-center ">
            <img src="/Google_Drive_Logo.svg" alt="google drive logo" />
          </div>
          <DialogTitle>Sync your Google Drive</DialogTitle>
          <DialogDescription>
            {inProgress
              ? "Your Drive is already being indexed in the background. You can close this and keep chatting."
              : "Connect your Drive so Sloth can index your files. This runs in the background — you can keep chatting while we process them."}
          </DialogDescription>
        </DialogHeader>

        {loadingStatus ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Checking sync status…
          </div>
        ) : null}

        {!loadingStatus && statusInfo ? (
          <p className="text-sm text-muted-foreground">
            Status:{" "}
            <span className="font-medium text-foreground">
              {statusInfo.status === "QUEUED"
                ? "Queued"
                : statusInfo.status === "RUNNING"
                  ? "Indexing"
                  : statusInfo.status === "FAILED"
                    ? "Failed"
                    : statusInfo.hasSynced
                      ? "Ready"
                      : "Not synced"}
            </span>
          </p>
        ) : null}

        {error || statusInfo?.errorMessage ? (
          <p className="text-sm text-destructive">
            {error ?? statusInfo?.errorMessage}
          </p>
        ) : null}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {inProgress ? "Close" : "Maybe later"}
          </Button>

          {inProgress ? null : (
            <Button disabled={busy} onClick={() => void handleStartSync()}>
              {starting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Starting sync…
                </>
              ) : (
                <>
                  <Cloud className="size-4" />
                  Sync Drive
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
