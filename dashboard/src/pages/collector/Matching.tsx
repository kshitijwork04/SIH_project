import { useNavigate, useParams } from "react-router-dom";
import { MapPin, Truck, ShieldCheck, ShieldAlert } from "lucide-react";
import { useApp } from "../../lib/store";
import { repo, repoWrite } from "../../lib/repository";
import { useRepoSync } from "../../lib/useRepoSync";
import CategoryIcon from "../../components/CategoryIcon";
import { rankRecyclers, CATEGORY_LABELS } from "../../lib/engine";
import { formatRupee, formatNum, shortId } from "../../lib/format";

export default function Matching() {
  const { t } = useApp();
  const { lotId } = useParams<{ lotId: string }>();
  const nav = useNavigate();
  useRepoSync();

  const tx = repo.getTransaction(lotId ?? "");
  const collector = repo.getCollector();
  if (!tx) return <p className="text-ink-400">{t("noTransactions")}</p>;

  const ranked = rankRecyclers(
    repo.getRecyclers(),
    tx.material_category,
    collector.operating_lat,
    collector.operating_lng
  );

  const choose = (recyclerId: string) => {
    repoWrite.matchLot(tx.lot_id, recyclerId);
    nav(`/handover/${tx.lot_id}`);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-ink-800">{t("availableNearby")}</h1>

      <div className="card flex items-center justify-between bg-brand-50">
        <div className="flex items-center gap-2">
          <CategoryIcon category={tx.material_category} size={22} className="text-brand-700" />
          <span className="font-semibold text-brand-800">
            {CATEGORY_LABELS[tx.material_category]} · {tx.weight} kg
          </span>
        </div>
        <span className="text-2xs text-ink-400">#{shortId(tx.lot_id)}</span>
      </div>

      <div className="space-y-3">
        {ranked.map((r) => (
          <div key={r.recycler_id} className="card space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-ink-800">{r.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-400">
                  <MapPin size={13} /> {r.facility_location_name} ·{" "}
                  {formatNum(r.distanceKm, 1)} km
                </p>
              </div>
              {r.authorization_status === "authorized" ? (
                <span className="badge bg-green-100 text-green-700">
                  <ShieldCheck size={13} /> {t("confirmed")}
                </span>
              ) : (
                <span className="badge bg-amber-100 text-amber-700">
                  <ShieldAlert size={13} /> {r.authorization_status}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between rounded-xl bg-ink-50 px-3 py-2">
              <div>
                <p className="text-2xs text-ink-400">{t("rateForKg")}</p>
                <p className="text-lg font-extrabold text-brand-700">
                  {r.offeredRate ? formatRupee(r.offeredRate) : "—"}
                </p>
              </div>
              <span className="text-2xs text-ink-400">
                {t("distance")}: {formatNum(r.distanceKm, 1)} km
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1 text-xs ${
                  r.pickup_availability ? "text-brand-700" : "text-ink-400"
                }`}
              >
                <Truck size={14} /> {r.pickup_availability ? t("pickup") : t("noPickup")}
              </span>
              <button
                onClick={() => choose(r.recycler_id)}
                className="btn-primary px-4 py-2 text-sm"
              >
                {t("chooseRecycler")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
