import type { Lang } from "./types";

const NAME_KEY = "kc-collector-name";
const LANG_KEY = "kc-collector-lang";
const LOCATION_KEY = "kc-collector-location";

export function getCollectorName(): string | null {
  try {
    return localStorage.getItem(NAME_KEY);
  } catch {
    return null;
  }
}

export function setCollectorName(name: string): void {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    /* ignore */
  }
}

// --- Step 2.6 minimal profile: language + general operating location only ---

export function getCollectorLang(): Lang {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return v === "hi" || v === "mr" ? v : "en";
  } catch {
    return "en";
  }
}

export function setCollectorLang(lang: Lang): void {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* ignore */
  }
}

export function getCollectorLocation(): string {
  try {
    return localStorage.getItem(LOCATION_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setCollectorLocation(location: string): void {
  try {
    localStorage.setItem(LOCATION_KEY, location);
  } catch {
    /* ignore */
  }
}
