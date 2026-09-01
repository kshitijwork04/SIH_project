import { useApp } from "../lib/store";
import type { LanguageCode } from "../lib/types";

const OPTIONS: { code: LanguageCode; label: string; native: string }[] = [
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "en", label: "English", native: "English" },
];

export default function LanguageSwitcher({
  onSelect,
  large = false,
}: {
  onSelect?: (l: LanguageCode) => void;
  large?: boolean;
}) {
  const { lang, setLang } = useApp();
  return (
    <div className="grid w-full grid-cols-3 gap-2">
      {OPTIONS.map((o) => {
        const active = lang === o.code;
        return (
          <button
            key={o.code}
            onClick={() => {
              setLang(o.code);
              onSelect?.(o.code);
            }}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 font-semibold transition-colors ${
              large ? "py-5 text-lg" : "py-2.5 text-sm"
            } ${
              active
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-ink-200 bg-white text-ink-700 hover:border-brand-500"
            }`}
          >
            <span>{o.native}</span>
            {large && <span className="text-xs opacity-80">{o.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
