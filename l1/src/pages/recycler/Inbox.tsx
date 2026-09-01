import { useEffect, useState } from "react";
import {
  fetchPendingTransactions,
  fetchMaterialsByIds,
  confirmTransaction,
  confirmTraceabilityByLot,
} from "../../lib/data";
import { I18nContext } from "../../lib/i18n";
import { useContext } from "react";
import type { Material, Transaction } from "../../lib/types";
import Spinner from "../../components/Spinner";
import { Recycle } from "lucide-react";

interface PendingRow {
  txn: Transaction;
  material?: Material;
}

export default function RecyclerInbox() {
  const { t } = useContext(I18nContext);
  const [rows, setRows] = useState<PendingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // final price per transaction id
  const [finalPrices, setFinalPrices] = useState<Record<string, number>>({});

  async function load() {
    setLoading(true);
    const txns = await fetchPendingTransactions();
    const materials = await fetchMaterialsByIds(txns.map((x) => x.lot_id));
    const materialById = new Map(materials.map((m) => [m.id, m]));
    setRows(txns.map((txn) => ({ txn, material: materialById.get(txn.lot_id) })));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function confirm(txn: Transaction) {
    setUpdatingId(txn.id);
    setError(null);
    try {
      const finalPrice = finalPrices[txn.id] ?? txn.estimated_value ?? 0;
      await confirmTransaction(txn.id, finalPrice);
      // Step 2.5 — reflect confirmation on the matching traceability row.
      await confirmTraceabilityByLot(txn.lot_id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 shadow-lg shadow-emerald-900/10">
        <div className="mx-auto flex max-w-md items-center gap-2.5 px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <Recycle className="h-5 w-5 text-white" />
          </span>
          <div className="leading-tight">
            <div className="text-base font-extrabold tracking-tight text-white">{t.inbox.title}</div>
            <div className="text-[11px] font-medium text-emerald-100/90">{t.appName}</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-4">
        <h1 className="screen-title mb-4">{t.inbox.pending}</h1>

        {error && <p className="mb-3 text-sm font-medium text-red-600">{error}</p>}

        {loading ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-gray-500">{t.inbox.empty}</p>
        ) : (
          <div className="space-y-3">
            {rows.map(({ txn, material }) => (
              <div key={txn.id} className="card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900">
                    {material?.category ?? "Lot"}
                  </span>
                  <span className="badge bg-amber-100 font-semibold text-amber-700">
                    {t.common.pending}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>{t.inbox.weight}</span>
                    <span className="font-semibold text-gray-900">
                      {material?.weight ?? "—"} {t.common.kg}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.inbox.estimatedValue}</span>
                    <span className="font-semibold text-emerald-700">
                      ₹{material?.estimated_value?.toFixed(2) ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.inbox.collector}</span>
                    <span className="font-semibold text-gray-900">{txn.collector_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.common.ref}</span>
                    <span className="font-mono text-gray-500">
                      {txn.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                </div>

                {material?.photo_url && (
                  <img
                    src={material.photo_url}
                    alt="Lot"
                    className="mt-3 h-32 w-full rounded-xl object-cover"
                  />
                )}

                <div className="mt-4">
                  <label className="label">{t.inbox.finalPrice}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={material?.estimated_value?.toFixed(2)}
                    onChange={(e) =>
                      setFinalPrices((prev) => ({
                        ...prev,
                        [txn.id]: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="input"
                  />
                  <p className="mt-1 text-xs text-gray-400">{t.inbox.finalPriceHint}</p>
                </div>

                <button
                  onClick={() => confirm(txn)}
                  disabled={updatingId === txn.id}
                  className="btn-brand mt-3 w-full"
                >
                  {updatingId === txn.id ? t.inbox.confirming : t.inbox.confirm}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
