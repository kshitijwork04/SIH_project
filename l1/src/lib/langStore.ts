import type { Lang } from "./types";
import { getCollectorLang, setCollectorLang } from "./collector";
import { getDict, type Dict } from "./i18n";

// Tiny reactive store so that the language chosen on the enter screen (or via
// the header selector) is reflected app-wide as soon as it changes, without
// needing prop-drilling through react-router routes.

type Listener = () => void;

let current: Lang = getCollectorLang();
const listeners = new Set<Listener>();

export function getLang(): Lang {
  return current;
}

export function getDictFor(lang: Lang): Dict {
  return getDict(lang);
}

export function setLang(lang: Lang): void {
  current = lang;
  setCollectorLang(lang);
  listeners.forEach((fn) => fn());
}

export function subscribeLang(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
