import { Link } from "react-router-dom";
import { PlusCircle, BadgeIndianRupee, LineChart, ShieldCheck } from "lucide-react";
import { useApp } from "../../lib/store";
import { repo } from "../../lib/repository";
import { useRepoSync } from "../../lib/useRepoSync";
import { StatusBadge } from "../../components/StatusBadge";
import { formatRupee, shortId } from "../../lib/format";
import { CATEGORY_LABELS } from "../../lib/engine";

export default function Home() {
  const { t } = useApp();
  useRepoSync();
  const txns = repo.getTransactions();
  const recent = txns.slice(0, 3);
  const earned = txns
    .filter((x) => x.final_price !== undefined)
    .reduce((a, x) => a + (x.final_price ?? 0), 0);
  const pending = txns.filter(
    (x) => x.transaction_status !== "completed"
  ).length;

  const quick = [
    { to: "/new-lot", key: "newLot", icon: PlusCircle, tone: "bg-brand-600 text-white" },
    { to: "/prices", key: "priceBoard", icon: LineChart, tone: "bg-white text-brand-700 border-2 border-ink-100" },
    { to: "/ledger", key: "myEarnings", icon: BadgeIndianRupee, tone: "bg-gold-500 text-ink-950" },
    { to: "/safety", key: "safety", icon: ShieldCheck, tone: "bg-white text-brand-700 border-2 border-ink-100" },
  ];

  return (
    <div className="space-y-5">
      {/* Earnings hero */}
      <section className="card bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <p className="text-sm text-brand-100">{t("earningsOverview")}</p>
        <p className="mt-1 text-4xl font-extrabold">{formatRupee(earned)}</p>
        <div className="mt-4 flex gap-3 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
            {t("incomingLots")}: {pending} {t("pendingSync")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
            {t("previousEarnings")}: {txns.length}
          </span>
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-3">
        {quick.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition-transform active:scale-95 ${q.tone}`}
          >
            <q.icon size={28} />
            <span className="text-sm font-semibold">
              {t(q.key as any)}
            </span>
          </Link>
        ))}
      </section>

      {/* Big create CTA */}
      <Link
        to="/new-lot"
        className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 py-6 text-lg font-bold text-brand-700"
      >
        <PlusCircle size={26} /> {t("newLot")}
      </Link>

      {/* Recent transactions */}
      <section>
        <h2 className="mb-2 text-base font-bold text-ink-700">
          {t("myEarnings")}
        </h2>
        {recent.length === 0 ? (
          <div className="card text-center text-sm text-ink-400">
            {t("noTransactions")}
          </div>
        ) : (
          <ul className="divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
            {recent.map((tx) => (
              <li key={tx.lot_id} className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-800">
                    {CATEGORY_LABELS[tx.material_category]} · {tx.weight} kg
                  </p>
                  <p className="text-xs text-ink-400">#{shortId(tx.lot_id)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={tx.transaction_status} />
                  <span className="text-sm font-bold text-brand-700">
                    {formatRupee(tx.final_price ?? tx.quoted_price)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}