import { Flame, Droplets, BatteryWarning, MonitorX, ShieldCheck } from "lucide-react";
import { useApp } from "../../lib/store";
import Speaker from "../../components/Speaker";

const ITEMS = [
  { key: "noBurning", icon: Flame, tone: "bg-red-50 text-red-600" },
  { key: "noAcid", icon: Droplets, tone: "bg-orange-50 text-orange-600" },
  { key: "batteryCare", icon: BatteryWarning, tone: "bg-amber-50 text-amber-600" },
  { key: "crtCare", icon: MonitorX, tone: "bg-purple-50 text-purple-600" },
];

const SAFE = [
  { icon: ShieldCheck, key: "glove" },
  { icon: ShieldCheck, key: "separateBattery" },
  { icon: ShieldCheck, key: "keepSealed" },
];

export default function Safety() {
  const { t } = useApp();
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-extrabold text-ink-800">{t("safetyTitle")}</h1>
      <p className="text-sm text-ink-600">{t("safetyIntro")}</p>

      <div className="space-y-3">
        {ITEMS.map((item) => (
          <div key={item.key} className="card flex items-center gap-4 border-l-4 border-red-400">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${item.tone}`}>
              <item.icon size={30} />
            </div>
            <div>
              <p className="font-bold text-ink-800">{t(item.key as any)}</p>
              <p className="text-xs text-ink-400">⚠</p>
            </div>
          </div>
        ))}
      </div>

      <section className="card bg-green-50">
        <h2 className="mb-3 font-bold text-green-800">{t("doThisInstead")}</h2>
        <div className="grid grid-cols-3 gap-2">
          {SAFE.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1 rounded-xl bg-white p-3 text-center">
              <s.icon size={22} className="text-green-600" />
              <span className="text-2xs font-semibold text-ink-700">{t(s.key as any)}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-center pt-2">
        <Speaker
          text={ITEMS.map((i) => t(i.key as any)).join(". ") + "."}
          className="px-5 py-3"
        />
      </div>
    </div>
  );
}
