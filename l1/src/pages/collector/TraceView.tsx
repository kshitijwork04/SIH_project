import { useEffect, useState } from "react";
import { fetchTraceabilityForCollector, fetchMaterialsByIds, journeyStatus } from "../../lib/data";
import { getCollectorName } from "../../lib/collector";
import { useI18n } from "../../lib/i18n";
import type { Material, Traceability } from "../../lib/types";
import Spinner from "../../components/Spinner";
import { Route, MapPin } from "lucide-react";

const STAGES = ["created", "matched", "handed_over", "confirmed"] as const;

export default function TraceView() {
  const { t } = useI18n();
  const [records, setRecords] = useState<{ trace: Traceability; material?: Material }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const collectorId = getCollectorName() ?? "unknown";
      const traces = await fetchTraceabilityForCollector(collectorId);
      const materials = await fetchMaterialsByIds(traces.map((x) => x.lot_id));
      const byId = new Map(materials.map((m) => [m.id, m]));
      if (!cancelled) {
        setRecords(traces.map((trace) => ({ trace, material: byId.get(trace.lot_id) })));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Route className="h-6 w-6 text-emerald-600" />
        <h1 className="screen-title">{t.trace.title}</h1>
      </div>

      {loading ? (
        <Spinner />
      ) : records.length === 0 ? (
        <p className="py-8 text-center text-gray-500">{t.trace.empty}</p>
      ) : (
        <div className="space-y-3">
          {records.map(({ trace, material }) => {
            const current = journeyStatus(trace);
            const currentIdx = STAGES.indexOf(current);
            return (
              <div key={trace.id} className="card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-bold text-gray-900">{material?.category ?? "Lot"}</span>
                  <span className="font-mono text-xs font-semibold text-emerald-700">
                    {trace.handover_reference_number}
                  </span>
                </div>

                <ol className="mb-4 flex items-center">
                  {STAGES.map((stage, i) => {
                    const reached = i <= currentIdx;
                    const label =
                      stage === "created"
                        ? t.trace.stageCreated
                        : stage === "matched"
                        ? t.trace.stageMatched
                        : stage === "handed_over"
                        ? t.trace.stageHandedOver
                        : t.trace.stageConfirmed;
                    return (
                      <li key={stage} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                              reached ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span
                            className={`mt-1 text-[10px] font-medium ${
                              reached ? "text-emerald-700" : "text-gray-500"
                            }`}
                          >
                            {label}
                          </span>
                        </div>
                        {i < STAGES.length - 1 && (
                          <span
                            className={`mx-1 h-0.5 flex-1 ${
                              i < currentIdx ? "bg-emerald-500" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </li>
                    );
                  })}
                </ol>

                <div className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>{t.trace.weight}</span>
                    <span className="font-semibold text-gray-900">{trace.weight} {t.common.kg}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.trace.gps}</span>
                    <span className="font-medium">
                      {trace.gps_lat !== null
                        ? `${trace.gps_lat.toFixed(5)}, ${trace.gps_lng?.toFixed(5)}`
                        : t.trace.notCaptured}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.trace.recyclerConfirmed}</span>
                    <span
                      className={
                        trace.recycler_confirmed
                          ? "font-semibold text-emerald-700"
                          : "badge bg-amber-100 text-amber-700 font-semibold"
                      }
                    >
                      {trace.recycler_confirmed ? t.common.confirmed : t.common.pending}
                    </span>
                  </div>
                </div>

                {trace.gps_lat !== null && (
                  <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                    <MapPin className="h-3.5 w-3.5" />
                    {new Date(trace.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
