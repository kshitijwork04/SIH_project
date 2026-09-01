import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { repo, repoWrite, setCloudHook, subscribe } from "./repository";
import { translate, type I18nKey } from "./i18n";
import { pullCatalog, pushLiveData } from "./supsync";
import { isSupabaseConfigured } from "./supabase";
import type { LanguageCode } from "./types";

interface AppContextValue {
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
  t: (key: I18nKey) => string;
  reload: () => void;
  // Live-backend status for UI indicators
  cloudConnected: boolean;
  catalogSource: "seed" | "supabase";
  pushPending: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(
    () => repo.getCollector().preferred_language
  );
  const [, setTick] = useState(0);

  // Keep UI in sync with repo/localStorage changes.
  useEffect(() => subscribe(() => setTick((n) => n + 1)), []);

  // On mount: if Supabase is configured, pull the live catalog (recyclers+prices)
  // into the local cache so the price board / matching show live DB data.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    pullCatalog();
  }, []);

  // Offline-first sync: register a fire-and-forget cloud hook so any local write
  // (lot created, handover confirmed, collector updated…) triggers an async push
  // to Supabase. Non-blocking and safe to run whenever — offline it's a no-op and
  // the local localStorage layer (source of truth) is untouched. Idempotent
  // upserts make redundant calls harmless.
  //
  // We also flush once on mount so any writes whose push was interrupted (e.g. the
  // tab closed, or a page unload cancelled the in-flight request) on the previous
  // visit are retried from their persisted sync-queue on the next load.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    setCloudHook(() => {
      pushLiveData();
    });
    pushLiveData();
    return () => setCloudHook(undefined);
  }, []);

  const value = useMemo<AppContextValue>(() => {
    const status = repo.getSyncStatus();
    return {
      lang,
      setLang: (l) => {
        repoWrite.setCollectorLanguage(l);
        setLangState(l);
      },
      t: (key) => translate(lang, key),
      reload: () => setTick((n) => n + 1),
      cloudConnected: isSupabaseConfigured(),
      catalogSource: repo.getCatalogSource(),
      pushPending: !status.synced,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, repo.getSyncStatus().synced]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
