import type { LanguageCode } from "./types";

// ============================================================================
// Audio narration (section 8): price board + safety guidance must have audio.
// Web uses the browser Speech Synthesis API. On the future Expo mobile app,
// swap this module for expo-speech — the public interface stays the same.
// ============================================================================

export function speak(text: string, lang: LanguageCode): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "hi" ? "hi-IN" : lang === "mr" ? "mr-IN" : "en-IN";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}
