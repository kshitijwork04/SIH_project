import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createTransaction, createTraceability, fetchRankedRecyclers, recyclerScore } from "../../lib/data";
import { getCollectorName, getCollectorLang } from "../../lib/collector";
import { useI18n } from "../../lib/i18n";
import { speak } from "../../lib/speech";
import type { Material, Recycler } from "../../lib/types";
import Spinner from "../../components/Spinner";
import { Recycle, ChevronRight, Truck, Phone, MapPin, ShieldCheck } from "lucide-react";

export default function Recyclers() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { state } = useLocation() as { state?: { lot?: Material } };
  const lot: Material | undefined = state?.lot;

  const [recyclers, setRecyclers] = useState<Recycler[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRankedRecyclers().then((r) => {
      setRecyclers(r);
      setLoading(false);
    });
  }, []);

  if (!lot) {
    return <div className="py-10 text-center text-gray-500">{t.recyclers.noLot}</div>;
  }

  function announce(recycler: Recycler) {
    speak(`${recycler.name}, ${t.recyclers.offers.replace("{rate}", String(recycler.offered_rate))}`, getCollectorLang());
  }

  async function choose(recycler: Recycler) {
    setSubmittingId(recycler.id);
    setError(null);
    try {
      const collectorId = getCollectorName() ?? "unknown";
      const txn = await createTransaction({
        lot_id: lot!.id,
        collector_id: collectorId,
        recycler_id: recycler.id,
        estimated_value: lot!.estimated_value,
      });
      // Step 2.5 — capture GPS + photo and write a traceability row alongside
      // the transaction row.
      const trace = await createTraceability({
        lot_id: lot!.id,
        photo_url: lot!.photo_url,
        weight: lot!.weight,
        transaction_id: txn.id,
      });
      navigate("/collector/handover", {
        state: { transaction: txn, trace, lot, recycler },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.recyclers.creating);
      setSubmittingId(null);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="screen-title">{t.recyclers.title}</h1>
      </div>

      {/* Lot summary */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-3.5">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white">
          <Recycle className="h-6 w-6" />
        </div>
        <div className="text-sm text-emerald-900">
          {t.recyclers.lotSummary
            .replace("{category}", lot.category)
            .replace("{weight}", String(lot.weight))
            .replace("{value}", lot.estimated_value.toFixed(2))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-3">
          {recyclers.map((r, idx) => {
            const score = recyclerScore(r);
            return (
              <button
                key={r.id}
                onClick={() => choose(r)}
                onFocus={() => announce(r)}
                disabled={submittingId === r.id}
                className="card group flex w-full items-center justify-between p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md disabled:opacity-60"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="badge bg-emerald-600 text-white">
                      #{idx + 1}
                    </span>
                    <span className="truncate text-base font-bold text-gray-900">{r.name}</span>
                  </div>

                  {r.authorization_status === "authorized" && (
                    <span className="badge mt-1.5 bg-emerald-100 text-emerald-700">
                      <ShieldCheck className="h-3 w-3" /> {t.recyclers.authorized}
                    </span>
                  )}
                  {r.authorization_status === "pending" && (
                    <span className="badge mt-1.5 bg-amber-100 text-amber-700">{t.recyclers.authPending}</span>
                  )}
                  {r.authorization_status === "expired" && (
                    <span className="badge mt-1.5 bg-red-100 text-red-600">{t.recyclers.authExpired}</span>
                  )}

                  <div className="mt-1.5 text-sm text-gray-500">{r.materials_accepted}</div>
                  <div className="mt-1 text-lg font-extrabold text-emerald-700">
                    {t.recyclers.offers.replace("{rate}", String(r.offered_rate))}
                  </div>

                  <div className="mt-1.5 space-y-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      {t.recyclers.location.replace("{loc}", r.facility_location)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      {r.pickup_availability ? t.recyclers.pickup : t.recyclers.noPickup}
                      <span className="text-gray-300">·</span>
                      <span>{t.recyclers.serviceArea.replace("{area}", r.service_area)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      {t.recyclers.contact.replace("{contact}", r.contact_details)}
                    </div>
                    <div className="text-gray-400">
                      {t.recyclers.registration.replace("{reg}", r.authorization_registration_number)} ·{" "}
                      {t.recyclers.score.replace("{score}", score.toFixed(2))}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-500" />
              </button>
            );
          })}
          {submittingId && (
            <div className="py-4 text-center text-sm text-gray-500">{t.recyclers.creating}</div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
