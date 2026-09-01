import { CloudOff, RefreshCw, CloudCog, Database } from "lucide-react";
import { repo, syncNow } from "../lib/repository";
import { useApp } from "../lib/store";
import { useRepoSync } from "../lib/useRepoSync";
import { pushLiveData } from "../lib/supsync";

export default function SyncBanner() {
  const { t, cloudConnected, catalogSource, pushPending } = useApp();
  useRepoSync();
  const status = repo.getSyncStatus();

  // Cloud is configured and fully synced
  if (cloudConnected && !pushPending) {
    return (
      <div className="flex items-center justify-between gap-2 border-b border-ink-100 bg-white px-4 py-1.5 text-xs">
        <span className="inline-flex items-center gap-1.5 text-brand-700">
          <CloudCog size={14} />
          {t("liveData")}
          {catalogSource === "supabase" && (
            <span className="badge bg-brand-100 text-brand-700">
              <Database size={11} /> Cloud DB
            </span>
          )}
        </span>
        <span className="hidden text-ink-400 sm:inline">
          {status.lastSyncedAt
            ? "last sync " + new Date(status.lastSyncedAt).toLocaleTimeString("en-IN")
            : ""}
        </span>
      </div>
    );
  }

  // Cloud configured but has pending writes to push
  if (cloudConnected && pushPending) {
    return (
      <div className="flex items-center justify-between gap-2 border-b border-offline-500/30 bg-offline-50 px-4 py-1.5 text-xs">
        <span className="inline-flex items-center gap-1.5 font-semibold text-offline-600">
          <CloudCog size={14} />
          <span className="inline-flex items-center gap-1">
            {t("pendingSync")}
            {status.queueLength > 0 && (
              <span className="badge bg-offline-500 text-white">{status.queueLength}</span>
            )}
          </span>
        </span>
        <button
          onClick={() => { pushLiveData(); syncNow(); }}
          className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-2.5 py-1 font-semibold text-white hover:bg-brand-700"
        >
          <RefreshCw size={12} /> Sync
        </button>
      </div>
    );
  }

  // No cloud configured: offline / local mode
  return (
    <div className="flex items-center justify-between gap-2 border-b border-ink-100 bg-white px-4 py-1.5 text-xs">
      <span className="inline-flex items-center gap-1.5 text-ink-500">
        <CloudOff size={14} />
        {t("cachedData")} · local
      </span>
      <button
        onClick={() => syncNow()}
        className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-2.5 py-1 font-semibold text-white hover:bg-brand-700"
      >
        <RefreshCw size={12} /> Sync
      </button>
    </div>
  );
}
