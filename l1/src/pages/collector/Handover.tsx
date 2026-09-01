import { useLocation, Link } from "react-router-dom";
import { useI18n } from "../../lib/i18n";
import type { Material, Recycler, Traceability, Transaction } from "../../lib/types";
import { CheckCircle2, Receipt, MapPin } from "lucide-react";

export default function Handover() {
  const { t } = useI18n();
  const { state } = useLocation() as {
    state?: {
      transaction?: Transaction;
      trace?: Traceability;
      lot?: Material;
      recycler?: Recycler;
    };
  };
  const { transaction, trace, lot, recycler } = state ?? {};

  return (
    <div className="pt-6 text-center">
      <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-600/30">
        <CheckCircle2 className="h-11 w-11 text-white" />
      </div>
      <h1 className="screen-title">{t.handover.title}</h1>
      <p className="mb-6 text-sm text-gray-500">{t.handover.subtitle}</p>

      {transaction && (
        <div className="card mb-6 p-4 text-left">
          <div className="mb-3 flex items-center justify-center gap-2 text-gray-500">
            <Receipt className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-semibold">{t.handover.reference}</span>
          </div>
          <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-4 text-center font-mono text-2xl font-extrabold tracking-wide text-emerald-700">
            {trace?.handover_reference_number ?? transaction.id.slice(0, 8).toUpperCase()}
          </div>
        </div>
      )}

      {trace && (
        <div
          className={`mb-4 flex items-center justify-center gap-2 rounded-2xl p-3 text-sm font-medium ${
            trace.gps_lat !== null
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          <MapPin className="h-4 w-4 shrink-0" />
          {trace.gps_lat !== null
            ? `${t.handover.gps} (${trace.gps_lat.toFixed(5)}, ${trace.gps_lng?.toFixed(5)})`
            : t.handover.gpsUnavailable}
        </div>
      )}

      {lot && recycler && (
        <div className="card mb-6 p-4 text-left text-sm">
          <div className="flex justify-between border-b border-gray-50 py-2">
            <span className="text-gray-500">{t.common.material}</span>
            <span className="font-semibold text-gray-900">{lot.category}</span>
          </div>
          <div className="flex justify-between border-b border-gray-50 py-2">
            <span className="text-gray-500">{t.common.weight}</span>
            <span className="font-semibold text-gray-900">{lot.weight} {t.common.kg}</span>
          </div>
          <div className="flex justify-between border-b border-gray-50 py-2">
            <span className="text-gray-500">{t.handover.estimatedValue}</span>
            <span className="font-semibold text-emerald-700">₹{lot.estimated_value.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-50 py-2">
            <span className="text-gray-500">{t.common.recycler}</span>
            <span className="font-semibold text-gray-900">{recycler.name}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">{t.common.status}</span>
            <span className="badge bg-amber-100 font-semibold text-amber-700">{t.common.pending}</span>
          </div>
        </div>
      )}

      <Link to="/collector/ledger" className="btn-brand w-full py-4 text-base">
        {t.handover.viewLedger}
      </Link>
    </div>
  );
}
