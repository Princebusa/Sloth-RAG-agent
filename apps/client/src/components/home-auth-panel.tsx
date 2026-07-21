"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export function HomeAuthPanel() {
  const { data: session, status } = useSession();
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  if (status === "loading") {
    return <p className="text-sm text-zinc-500">Checking session…</p>;
  }

  if (!session?.user) {
    return null;
  }

  async function handleSync() {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch("/api/drive/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setSyncStatus(data.error ?? "Sync failed");
        return;
      }
      setSyncStatus(`Queued job ${data.jobId}`);
    } catch {
      setSyncStatus("Sync request failed");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex items-center gap-3">
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt=""
            className="h-10 w-10 rounded-full"
          />
        ) : null}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {session.user.name ?? "Signed in"}
          </p>
          <p className="truncate text-sm text-zinc-500">{session.user.email}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {syncing ? "Syncing…" : "Sync Google Drive"}
        </button>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="h-10 rounded-lg border border-zinc-300 px-4 text-sm font-medium text-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
        >
          Sign out
        </button>
      </div>

      {syncStatus ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{syncStatus}</p>
      ) : null}
    </div>
  );
}
