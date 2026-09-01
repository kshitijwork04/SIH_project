import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useApp } from "../../lib/store";
import { repo } from "../../lib/repository";
import { useRepoSync } from "../../lib/useRepoSync";
import Speaker from "../../components/Speaker";
import CategoryIcon from "../../components/CategoryIcon";
import { priceTrend, latestBaseRate, CATEGORY_LABELS, type Trend } from "../../lib/engine";
import { formatRupee } from "../../lib/format";
import type { MaterialCategory } from "../../lib/types";

const CATEGORIES: MaterialCategory[] = [
  "crt",
  "lcd",
  "pcb",
  "cables",
  "batteries",
  "motors",
  "plastics",
];

function TrendBadge({ trend }: { trend: Trend }) {
  const { t } = useApp();
  const map = {
    rising: { icon: TrendingUp, cls: "bg-green-100 text-green-700", key: "rising" },
    falling: { icon: TrendingDown, cls: "bg-red-100 text-red-600", key: "falling" },
    stable: { icon: Minus, cls: "bg-ink-100 text-ink-600", key: "stable" },
  };
  const { icon: Icon, cls, key } = map[trend];
  return (
    <span className={`badge ${cls}`}>
      <Icon size={13} /> {t(key as any)}
    </span>
  );
}

export default function PriceBoard() {
  const { t } = useApp();
  useRepoSync();
  const prices = repo.getPrices();
  const location = repo.getCollector().general_operating_location;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-ink-800">{t("priceBoard")}</h1>
      </div>
      <p className="text-xs text-ink-400">📍 {location} · {t("todayRate")}</p>

      <div className="space-y-3">
        {CATEGORIES.map((cat) => {
          const { trend, deltaPct } = priceTrend(prices, cat, location);
          const rate = latestBaseRate(prices, cat, location);
          return (
            <div key={cat} className="card flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <CategoryIcon category={cat} size={30} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink-800">
                  {CATEGORY_LABELS[cat]}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <TrendBadge trend={trend} />
                  {deltaPct !== 0 && (
                    <span className="text-2xs text-ink-400">
                      {trend === "rising" ? "+" : ""}
                      {deltaPct}%
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-extrabold text-brand-700">
                  {rate ? formatRupee(rate) : "—"}
                </p>
                <p className="text-2xs text-ink-400">/kg</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audio narration of the whole board */}
      <div className="flex justify-center pt-2">
        <Speaker
          text={
            CATEGORIES.map((cat) => {
              const r = latestBaseRate(prices, cat, location);
              return `${CATEGORY_LABELS[cat]} ${r ?? 0}`;
            }).join(". ")
          }
        />
      </div>
    </div>
  );
}
