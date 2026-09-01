import { useApp } from "../../lib/store";
import { repo } from "../../lib/repository";
import { useRepoSync } from "../../lib/useRepoSync";
import { StatusBadge } from "../../components/StatusBadge";
import CategoryIcon from "../../components/CategoryIcon";
import { CATEGORY_LABELS } from "../../lib/engine";
import { formatRupee, formatDateTime, shortId } from "../../lib/format";

export default function Ledger() {
  const { t } = useApp();
  useRepoSync();
  const txns = repo.getTransactions();

  const total = txns
    .filter((x) => x.final_price !== undefined)
    .reduce((a, x) => a + (x.final_price ?? 0), 0);
  const pending = txns
    .filter((x) => x.payment_status === "pending")
    .reduce((a, x) => a + (x.final_price ?? x.quoted_price), 0);
  const completedCount = txns.filter((x) => x.payment_status === "paid").length;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-extrabold text-ink-800">{t("myEarnings")}</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3 card bg-gradient-to-br from-brand-700 to-brand-900 text-white">
          <p className="text-xs text-brand-100">{t("earningsOverview")}</p>
          <p className="mt-1 text-3xl font-extrabold">{formatRupee(total)}</p>
        </div>
        <div className="card">
          <p className="text-2xs text-ink-400">{t("paymentPaid")}</p>
          <p className="text-lg font-extrabold text-green-600">{completedCount}</p>
        </div>
        <div className="card col-span-2">
          <p className="text-2xs text-ink-400">{t("paymentPending")}</p>
          <p className="text-lg font-extrabold text-amber-600">
            {formatRupee(pending)}
          </p>
        </div>
      </div>

      {/* History */}
      <section>
        <h2 className="mb-2 text-base font-bold text-ink-700">
          {t("previousEarnings")}
        </h2>
        {txns.length === 0 ? (
          <div className="card text-center text-sm text-ink-400">
            {t("noTransactions")}
          </div>
        ) : (
          <ul className="divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white">
            {txns.map((tx) => (
              <li key={tx.lot_id} className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <CategoryIcon category={tx.material_category} size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink-800">
                        {CATEGORY_LABELS[tx.material_category]} · {tx.weight} kg
                      </p>
                      <p className="text-2xs text-ink-400">
                        #{shortId(tx.lot_id)} · {t("referenceNumber")}:{" "}
                        {repo.getTraceability(tx.lot_id)?.handover_reference_number}
                      </p>
                      <p className="text-2xs text-ink-400">
                        {formatDateTime(tx.date_time)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={tx.transaction_status} />
                    <span className="text-sm font-extrabold text-brand-700">
                      {formatRupee(tx.final_price ?? tx.quoted_price)}
                    </span>
                    <span
                      className={`text-2xs font-semibold ${
                        tx.payment_status === "paid"
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}
                    >
                      {tx.payment_status === "paid"
                        ? t("paymentPaid")
                        : t("paymentPending")}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
