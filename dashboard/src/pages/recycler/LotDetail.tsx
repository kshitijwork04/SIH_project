import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Scale,
  Clock,
  Check,
  X,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  BadgeCheck,
} from "lucide-react";
import { useState } from "react";
import { useApp } from "../../lib/store";
import { repo, repoWrite } from "../../lib/repository";
import { useRepoSync } from "../../lib/useRepoSync";
import { StatusBadge } from "../../components/StatusBadge";
import CategoryIcon from "../../components/CategoryIcon";
import { detectAnomalies, CATEGORY_LABELS } from "../../lib/engine";
import { formatRupee, formatDateTime, shortId } from "../../lib/format";

export default function LotDetail() {
  const { t } = useApp();
  const { lotId } = useParams<{ lotId: string }>();
  useRepoSync();
  const [finalPrice, setFinalPrice] = useState("");
  const [rejected, setRejected] = useState(false);

  const tx = repo.getTransaction(lotId ?? "");
  const trace = repo.getTraceability(lotId ?? "");
  if (!tx || !trace) return <p className="text-ink-400">{t("noTransactions")}</p>;

  const allTx = repo.getTransactions();
  const anomaly = detectAnomalies(allTx, {
    ...tx,
    final_price: tx.final_price ?? tx.quoted_price,
  });

  const canConfirm = tx.transaction_status === "matched" || tx.transaction_status === "in-transit" || tx.transaction_status === "handed-over";
  const confirmed = tx.transaction_status === "confirmed" || tx.transaction_status === "completed";

  const confirm = () => {
    const price = tx.final_price !== undefined ? tx.final_price : Number(finalPrice);
    if (!price || price <= 0) return;
    repoWrite.confirmHandover(tx.lot_id, price);
  };

  return (
    <div className="space-y-4">
      <Link to="/recycler/inbox" className="btn-ghost px-0 py-1 text-sm">
        <ArrowLeft size={16} /> {t("backToInbox")}
      </Link>

      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <CategoryIcon category={tx.material_category} size={28} />
            </div>
            <div>
              <p className="font-extrabold text-ink-800">
                {CATEGORY_LABELS[tx.material_category]} · {tx.weight} {t("kg")}
              </p>
              <p className="text-2xs text-ink-400">#{shortId(tx.lot_id)}</p>
            </div>
          </div>
          <StatusBadge status={tx.transaction_status} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2">
            <BadgeCheck size={16} className="text-brand-600" />
            <span className="font-mono font-bold text-brand-800">
              {trace.handover_reference_number}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2">
            <Scale size={16} className="text-ink-400" /> {tx.weight} {t("kg")}
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2">
            <Clock size={16} className="text-ink-400" />
            {formatDateTime(trace.timestamp)}
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2">
            <MapPin size={16} className="text-ink-400" />
            {trace.gps_lat.toFixed(4)}, {trace.gps_lng.toFixed(4)}
          </div>
        </div>

        {trace.photographs.length > 0 && (
          <div className="mt-3 flex gap-2">
            {trace.photographs.map((p, i) => (
              <img
                key={i}
                src={p}
                alt=""
                className="h-20 w-20 rounded-xl border border-ink-100 object-cover"
              />
            ))}
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-500">{t("quote")}</span>
          <span className="text-lg font-bold text-ink-800">
            {formatRupee(tx.quoted_price)}
          </span>
        </div>

        {confirmed ? (
          <div className="flex items-center justify-between rounded-xl bg-green-50 px-3 py-2">
            <span className="text-sm font-semibold text-green-700">
              {t("finalPrice")}
            </span>
            <span className="text-lg font-extrabold text-green-700">
              {formatRupee(tx.final_price ?? tx.quoted_price)}
            </span>
          </div>
        ) : (
          <div>
            <label className="label">{t("finalPrice")}</label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-ink-400">₹</span>
              <input
                type="number"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                className="input"
                placeholder={String(tx.quoted_price)}
              />
            </div>
            <p className="mt-1 text-2xs text-ink-400">{t("finalPriceHint")}</p>
          </div>
        )}

        {/* Anomaly */}
        {anomaly && (
          <div
            className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${
              anomaly.flagged
                ? "border-amber-300 bg-amber-50 text-amber-800"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {anomaly.flagged ? (
              <AlertTriangle size={18} className="shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="shrink-0" />
            )}
            <div>
              <p className="font-bold">
                {anomaly.flagged ? t("anomalyReview") : t("normal")}
              </p>
              <p className="text-xs">
                {t("finalPrice")}: {formatRupee(anomaly.final_price)} · {t("mean")}{" "}
                {formatRupee(anomaly.expected_mean)} · {t("zScore")}={anomaly.z_score}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        {!confirmed && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={confirm}
              className="btn-primary flex-1"
              disabled={!canConfirm}
            >
              <Check size={18} /> {t("confirmHandover")}
            </button>
            <button
              onClick={() => setRejected(true)}
              className="btn btn-outline !text-red-600 !border-red-300"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {rejected && (
          <p className="text-sm font-semibold text-red-500">
            {t("rejectNote")}
          </p>
        )}

        {confirmed && (
          <button
            onClick={() => repoWrite.completeLot(tx.lot_id)}
            className="btn-gold w-full"
            disabled={tx.transaction_status === "completed"}
          >
            {t("markComplete")}
          </button>
        )}
      </div>
    </div>
  );
}
