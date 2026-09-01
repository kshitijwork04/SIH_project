import { useI18n } from "../../lib/i18n";
import { getCollectorLang } from "../../lib/collector";
import { speak, stopSpeaking } from "../../lib/speech";
import {
  Flame,
  Droplets,
  BatteryWarning,
  MonitorX,
  Volume2,
} from "lucide-react";
import type { ReactNode } from "react";

interface Tip {
  key: "burning" | "acid" | "battery" | "crt";
  icon: ReactNode;
  color: string;
}

const TIPS: Tip[] = [
  { key: "burning", icon: <Flame className="h-10 w-10" />, color: "bg-orange-50 text-orange-600" },
  { key: "acid", icon: <Droplets className="h-10 w-10" />, color: "bg-sky-50 text-sky-600" },
  { key: "battery", icon: <BatteryWarning className="h-10 w-10" />, color: "bg-yellow-50 text-yellow-600" },
  { key: "crt", icon: <MonitorX className="h-10 w-10" />, color: "bg-violet-50 text-violet-600" },
];

export default function Safety() {
  const { t } = useI18n();
  const lang = getCollectorLang();

  function readTip(key: Tip["key"]) {
    stopSpeaking();
    speak(`${t.safety[key].title}. ${t.safety[key].body}`, lang);
  }

  return (
    <div>
      <h1 className="screen-title">{t.safety.title}</h1>
      <p className="screen-sub mb-5">{t.safety.subtitle}</p>

      <div className="space-y-3">
        {TIPS.map((tip) => (
          <div key={tip.key} className="card p-4">
            <div className="flex items-start gap-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${tip.color}`}>
                {tip.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-gray-900">{t.safety[tip.key].title}</h2>
                <p className="mt-1 text-sm text-gray-600">{t.safety[tip.key].body}</p>
              </div>
            </div>
            <button
              onClick={() => readTip(tip.key)}
              className="btn-soft mt-3"
            >
              <Volume2 className="h-4 w-4" /> {t.safety.listen}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
