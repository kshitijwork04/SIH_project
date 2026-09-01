import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTransactionsByCollector, fetchMaterialsByIds, fetchRecyclers } from "../../lib/data";
import { getCollectorName } from "../../lib/collector";
import { useI18n } from "../../lib/i18n";
import type { Material, Recycler, Transaction } from "../../lib/types";
import Spinner from "../../components/Spinner";
import StatusBadge from "../../components/StatusBadge";
import { BookOpen, Route } from "lucide-react";

interface Row {
  txn: Transaction;
  material?: Material;
  recycler?: Recycler;
}

export default function Ledger() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const collectorId = getCollectorName() ?? "unknown";
      const txns = await fetchTransactionsByCollector(collectorId);
      const materials = await fetchMaterialsByIds(txns.map((x) => x.lot_id));
      const recyclers = await fetchRecyclers();
      const materialById = new Map(materials.map((m) => [m.id, m]));
      const recyclerById = new Map(recyclers.map((r) => [r.id, r]));
      if (!cancelled) {
        setRows(
          txns.map((txn) => ({
            txn,
            material: materialById.get(txn.lot_id),
            recycler: recyclerById.get(txn.recycler_id),
          }))
        );
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
        <BookOpen className="h-6 w-6 text-emerald-600" />
        <h1 className="screen-title">{t.ledger.title}</h1>
      </div>

      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-gray-500">{t.ledger.empty}</p>
      ) : (
        <div className="space-y-3">
          {rows.map(({ txn, material, recycler }) => (
            <div key={txn.id} className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">
                  {material?.category ?? "Lot"}
                </span>
                <StatusBadge status={txn.status} />
              </div>

              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>{t.ledger.estimatedValue}</span>
                  <span className="font-semibold text-gray-900">
                    ₹{txn.estimated_value?.toFixed(2) ?? material?.estimated_value?.toFixed(2) ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t.ledger.finalPrice}</span>
                  <span className="font-semibold text-emerald-700">
                    {txn.status === "confirmed" ? `₹${(txn.final_price ?? txn.estimated_value ?? 0).toFixed(2)}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t.ledger.paymentStatus}</span>
                  <span
                    className={`badge ${
                      txn.payment_status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {txn.payment_status === "paid" ? t.common.paid : t.ledger.notPaid}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t.common.weight}</span>
                  <span className="font-medium text-gray-900">
                    {material?.weight ?? "—"} {t.common.kg}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t.common.recycler}</span>
                  <span className="font-medium text-gray-900">
                    {recycler?.name ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t.common.ref}</span>
                  <span className="font-mono text-gray-500">
                    {txn.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              </div>

              <Link
                to={`/collector/trace`}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                <Route className="h-4 w-4" /> {t.ledger.trace}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
