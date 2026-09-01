import { useParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  MapPin,
  Clock,
  Scale,
  Copy,
  Hash,
  Home as HomeIcon,
} from "lucide-react";
import { useState } from "react";
import { useApp } from "../../lib/store";
import { repo } from "../../lib/repository";
import { useRepoSync } from "../../lib/useRepoSync";
import CategoryIcon from "../../components/CategoryIcon";
import { CATEGORY_LABELS } from "../../lib/engine";
import { formatDateTime, formatRupee } from "../../lib/format";

export default function Handover() {
  const { t } = useApp();
  const { lotId } = useParams<{ lotId: string }>();
  useRepoSync();
  const [copied, setCopied] = useState(false);

  const tx = repo.getTransaction(lotId ?? "");
  const trace = repo.getTraceability(lotId ?? "");
  if (!tx || !trace)
    return <p className="text-ink-400">{t("noTransactions")}</p>;

  const confirmed = tx.transaction_status === "confirmed" || tx.transaction_status === "completed";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(trace.handover_reference_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center pt-2 text-center">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full ${
            confirmed ? "bg-green-100 text-green-600" : "bg-brand-100 text-brand-600"
          }`}
        >
          <CheckCircle2 size={44} />
        </div>
        <h1 className="mt-3 text-2xl font-extrabold text-ink-800">
          {confirmed ? t("handoverDone") : t("lotCreated")}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {confirmed ? t("paymentPaid") : t("lotCreatedMsg")}
        </p>
      </div>

      {/* Reference number */}
      <section className="card text-center">
        <p className="label flex items-center justify-center gap-1 text-ink-400">
          <Hash size={14} /> {t("referenceNumber")}
        </p>
        <button
          onClick={copy}
          className="mt-1 flex items-center gap-2 font-mono text-2xl font-extrabold tracking-wider text-brand-800"
        >
          {trace.handover_reference_number}
          <Copy size={18} className="text-ink-400" />
        </button>
        {copied && <p className="text-xs text-green-600">Copied!</p>}
      </section>

      {/* Lot detail */}
      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CategoryIcon category={tx.material_category} size={22} className="text-brand-700" />
            <span className="font-bold text-ink-800">
              {CATEGORY_LABELS[tx.material_category]}
            </span>
          </div>
          <span className="text-sm font-bold text-brand-700">
            {formatRupee(tx.final_price ?? tx.quoted_price)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2">
            <Scale size={16} className="text-ink-400" /> {tx.weight} kg
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2">
            <Clock size={16} className="text-ink-400" />
            {formatDateTime(trace.timestamp)}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2 text-sm">
          <MapPin size={16} className="text-ink-400" />
          {trace.gps_lat.toFixed(4)}, {trace.gps_lng.toFixed(4)}
        </div>
      </section>

      {/* Photos */}
      {trace.photographs.length > 0 && (
        <section>
          <p className="label">📷 {t("photos")}</p>
          <div className="flex gap-3">
            {trace.photographs.map((p, i) => (
              <img
                key={i}
                src={p}
                alt=""
                className="h-24 w-24 rounded-xl border border-ink-100 object-cover"
              />
            ))}
          </div>
        </section>
      )}

      {/* Status note */}
      <section className="card bg-amber-50 border-amber-200 text-sm text-amber-800">
        {confirmed
          ? "✓ " + t("paymentPaid") + " — " + t("handoverDone")
          : t("inTransit") + " — " + t("paymentPending")}
      </section>

      <Link to="/home" className="btn-primary w-full">
        <HomeIcon size={18} /> {t("home")}
      </Link>
    </div>
  );
}
