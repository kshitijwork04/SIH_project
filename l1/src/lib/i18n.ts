import { createContext, useContext } from "react";
import type { Lang } from "./types";
import en from "./i18n/en.json";
import hi from "./i18n/hi.json";
import mr from "./i18n/mr.json";

export type Dict = typeof en;

const DICTS: Record<Lang, Dict> = { en, hi, mr };

export const LANGS: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
];

// I18n context: provides the active dictionary and a t() lookup.
export const I18nContext = createContext<{ lang: Lang; t: Dict }>({
  lang: "en",
  t: en,
});

export function useI18n() {
  return useContext(I18nContext);
}

export function getDict(lang: Lang): Dict {
  return DICTS[lang] ?? en;
}
