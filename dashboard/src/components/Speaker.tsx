import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useApp } from "../lib/store";
import { speak, stopSpeaking } from "../lib/speech";

interface SpeakerProps {
  text: string;
  className?: string;
}

export default function Speaker({ text, className }: SpeakerProps) {
  const { t, lang } = useApp();
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const onEnd = () => {
      activeRef.current = false;
      setActive(false);
    };
    window.speechSynthesis?.addEventListener("end", onEnd);
    window.speechSynthesis?.addEventListener("error", onEnd);
    return () => {
      window.speechSynthesis?.removeEventListener("end", onEnd);
      window.speechSynthesis?.removeEventListener("error", onEnd);
    };
  }, [active]);

  const toggle = () => {
    if (activeRef.current) {
      stopSpeaking();
      activeRef.current = false;
      setActive(false);
      return;
    }
    activeRef.current = true;
    setActive(true);
    speak(text, lang);
  };

  return (
    <button
      onClick={toggle}
      aria-label={active ? t("audioStop") : t("audioPlay")}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
        active
          ? "bg-brand-600 text-white"
          : "bg-brand-100 text-brand-700 hover:bg-brand-200"
      } ${className ?? ""}`}
    >
      {active ? <VolumeX size={18} /> : <Volume2 size={18} />}
      {active ? t("audioStop") : t("audioPlay")}
    </button>
  );
}
