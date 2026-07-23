"use client";

import { useState } from "react";
import {
  ExternalLink,
  FileText,
  FolderOpen,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type MyDriveBoxProps = {
  hasSynced: boolean;
  inProgress: boolean;
  status: "IDLE" | "QUEUED" | "RUNNING" | "FAILED";
  lastSyncedAt?: string | null;
  errorMessage?: string | null;
  onOpenSyncDialog?: () => void;
  className?: string;
};

type IndexedFile = {
  id: string;
  fileId: string;
  name: string;
  mimeType: string;
  webViewLink: string | null;
  sizeBytes: string | null;
  lastSyncedAt: string;
  extractedAt: string | null;
};

function formatBytes(value: string | null) {
  if (!value) return null;
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function shortMime(mimeType: string) {
  if (mimeType.includes("document")) return "Doc";
  if (mimeType.includes("spreadsheet")) return "Sheet";
  if (mimeType.includes("presentation")) return "Slides";
  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.startsWith("text/")) return "Text";
  return "File";
}

function statusLabel(
  status: MyDriveBoxProps["status"],
  hasSynced: boolean,
  lastSyncedLabel: string | null,
) {
  if (status === "QUEUED") return "Queued for sync…";
  if (status === "RUNNING") return "Indexing files…";
  if (status === "FAILED") return "Last sync failed";
  if (hasSynced) {
    return lastSyncedLabel ? `Last synced ${lastSyncedLabel}` : "Drive connected";
  }
  return "Not synced yet";
}

export function MyDriveBox({
  hasSynced,
  status,
  lastSyncedAt,
  errorMessage,
  onOpenSyncDialog,
  className,
}: MyDriveBoxProps) {
  const [filesOpen, setFilesOpen] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);
  const [files, setFiles] = useState<IndexedFile[]>([]);
  const [filesError, setFilesError] = useState<string | null>(null);

  async function openIndexedFiles() {
    setFilesOpen(true);
    setFilesLoading(true);
    setFilesError(null);

    try {
      const res = await fetch("/api/drive/files");
      const data = await res.json();

      if (!res.ok) {
        setFilesError(data.error ?? "Failed to load files");
        return;
      }

      setFiles((data.files as IndexedFile[]) ?? []);
    } catch {
      setFilesError("Failed to load files");
    } finally {
      setFilesLoading(false);
    }
  }

  const lastSyncedLabel = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <>
      <div
        className={cn(
          "mx-2 mb-3 rounded-xl border border-sidebar-border bg-white p-3",
          className,
        )}
      >
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Google_Drive_Logo.svg" alt="Drive" className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">My Drive</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
              {statusLabel(status, hasSynced, lastSyncedLabel)}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="justify-center gap-1.5"
            disabled={!hasSynced}
            onClick={() => void openIndexedFiles()}
          >
            <FolderOpen className="size-3.5" />
            Files
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="justify-center gap-1.5"
            onClick={() => onOpenSyncDialog?.()}
          >
            <RefreshCw className="size-3.5" />
            Sync
          </Button>
        </div>

        {errorMessage ? (
          <p className="mt-2 text-[11px] text-destructive">{errorMessage}</p>
        ) : null}
      </div>

      <Dialog open={filesOpen} onOpenChange={setFilesOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Indexed files</DialogTitle>
            <DialogDescription>
              Files from your Google Drive that Sloth has already indexed.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[360px] pr-2">
            {filesLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading files…
              </div>
            ) : filesError ? (
              <p className="py-8 text-center text-sm text-destructive">
                {filesError}
              </p>
            ) : files.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No indexed files yet. Sync your Drive first.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {files.map((file) => {
                  const sizeLabel = formatBytes(file.sizeBytes);
                  return (
                    <li
                      key={file.id}
                      className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                        <FileText className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {file.name}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {shortMime(file.mimeType)}
                          {sizeLabel ? ` · ${sizeLabel}` : ""}
                          {file.extractedAt ? " · Indexed" : ""}
                        </p>
                      </div>
                      {file.webViewLink ? (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          aria-label={`Open ${file.name}`}
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
