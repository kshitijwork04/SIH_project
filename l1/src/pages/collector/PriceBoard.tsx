import { useEffect, useState } from "react";
import { fetchPriceBoard } from "../../lib/data";
import { getCollectorLang } from "../../lib/collector";
import { useI18n } from "../../lib/i18n";
import { speak, stopSpeaking } from "../../lib/speech";
import type { PriceBoardRow } from "../../lib/types";
import Spinner from "../../components/Spinner";
import { TrendingUp, TrendingDown, Minus, Volume2 } from "lucide-react";

export default function PriceBoard() {
  const { t } = useI18n();
  const [rows, setRows] = useState<PriceBoardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPriceBoard().then((r) => {
      setRows(r);
      setLoading(false);
    });
  }, []);

  function readAloud(row: PriceBoardRow) {
    stopSpeaking();
    const lang = getCollectorLang();
    const trendText =
      row.trend === "up" ? t.priceBoard.up : row.trend === "down" ? t.priceBoard.down : t.priceBoard.stable;
    speak(`${row.category}. ${t.priceBoard.audio}. ${row.current} rupees per kg. ${t.priceBoard.trend} ${trendText}`, lang);
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="screen-title">{t.priceBoard.title}</h1>
        <p className="screen-sub">{t.priceBoard.range}</p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.category}
              className="card flex items-center justify-between p-4 transition hover:shadow-md"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-base font-semibold text-gray-900">{row.category}</span>
                  {row.trend === "up" && (
                    <span className="badge bg-emerald-100 text-emerald-700">
                      <TrendingUp className="h-3.5 w-3.5" /> {t.priceBoard.up}
                    </span>
                  )}
                  {row.trend === "down" && (
                    <span className="badge bg-red-100 text-red-600">
                      <TrendingDown className="h-3.5 w-3.5" /> {t.priceBoard.down}
                    </span>
                  )}
                  {row.trend === "stable" && (
                    <span className="badge bg-gray-100 text-gray-600">
                      <Minus className="h-3.5 w-3.5" /> {t.priceBoard.stable}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {t.priceBoard.range}: ₹{row.low}–₹{row.high}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xl font-extrabold text-emerald-700">
                    ₹{row.current}
                    <span className="ml-1 text-sm font-medium text-gray-400">{t.priceBoard.perKg}</span>
                  </div>
                  <button
                    onClick={() => readAloud(row)}
                    className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    aria-label={`${t.priceBoard.audio} ${row.category}`}
                  >
                    <Volume2 className="h-3.5 w-3.5" /> {t.priceBoard.audio}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="py-8 text-center text-gray-500">{t.priceBoard.empty}</p>
          )}
        </div>
      )}
    </div>
  );
}
