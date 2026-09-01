import { Link } from "react-router-dom";
import { Inbox as InboxIcon } from "lucide-react";
import { useApp } from "../../lib/store";
import { repo } from "../../lib/repository";
import { useRepoSync } from "../../lib/useRepoSync";
import { StatusBadge } from "../../components/StatusBadge";
import CategoryIcon from "../../components/CategoryIcon";
import { CATEGORY_LABELS } from "../../lib/engine";
import { formatRupee, formatDateTime, shortId } from "../../lib/format";

export default function Inbox() {
  const { t } = useApp();
  useRepoSync();
  const recycler = repo.getRecyclers()[0];
  const lots = repo
    .getTransactions()
    .filter(
      (tx) =>
        tx.recycler_id === recycler.recycler_id &&
        tx.transaction_status !== "created"
    )
    .sort((a, b) => b.date_time.localeCompare(a.date_time));

  const active = lots.filter(
    (tx) => tx.transaction_status !== "completed"
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-ink-800">{t("incomingLots")}</h1>
        <span className="badge bg-brand-600 text-white">{active} {t("lblOpen")}</span>
      </div>

      {lots.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-10 text-center text-ink-400">
          <InboxIcon size={40} />
          {t("noTransactions")}
        </div>
      ) : (
        <ul className="space-y-3">
          {lots.map((tx) => {
            const trace = repo.getTraceability(tx.lot_id);
            return (
              <li key={tx.lot_id}>
                <Link to={`/recycler/lot/${tx.lot_id}`} className="card block transition-shadow hover:shadow">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                        <CategoryIcon category={tx.material_category} size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-ink-800">
                          {CATEGORY_LABELS[tx.material_category]} · {tx.weight} {t("kg")}
                        </p>
                        <p className="text-2xs text-ink-400">
                          #{shortId(tx.lot_id)} · {formatDateTime(tx.date_time)}
                        </p>
                        {trace && (
                          <p className="text-2xs font-mono text-brand-600">
                            {trace.handover_reference_number}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={tx.transaction_status} />
                      <span className="text-sm font-extrabold text-brand-700">
                        {formatRupee(tx.final_price ?? tx.quoted_price)}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
