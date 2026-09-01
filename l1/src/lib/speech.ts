import type { Lang } from "./types";

// Simple wrapper around the browser Web Speech API (SpeechSynthesis). Reading
// the category name + rate aloud in the collector's selected language.

const LANG_TAG: Record<Lang, string> = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
};

const VOICE_PREFIX: Record<Lang, string[]> = {
  en: ["Google हिन्दी", "Google हिंदी", "Google मराठी", "Google UK English Female", "Google US English"],
  hi: ["Google हिन्दी", "Google हिंदी", "Google मराठी"],
  mr: ["Google मराठी", "Google हिन्दी", "Google हिंदी"],
};

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice(lang: Lang): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return undefined;
  const withLang = voices.filter((v) => v.lang && v.lang.startsWith(LANG_TAG[lang].slice(0, 2)));
  for (const prefix of VOICE_PREFIX[lang]) {
    const hit = withLang.find((v) => v.name.includes(prefix));
    if (hit) return hit;
  }
  return withLang.find((v) => v.lang === LANG_TAG[lang]) ?? withLang[0];
}

export function speak(text: string, lang: Lang): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANG_TAG[lang];
  utterance.rate = 0.95;
  const voice = pickVoice(lang);
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}
