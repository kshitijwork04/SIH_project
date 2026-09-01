import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCollectorName } from "../../lib/collector";
import { fetchTransactionsByCollector } from "../../lib/data";
import { useI18n } from "../../lib/i18n";
import {
  PlusCircle,
  TrendingUp,
  BookOpen,
  ShieldAlert,
  Route,
  Coins,
  Boxes,
  Timer,
  Recycle,
} from "lucide-react";

export default function Home() {
  const { t } = useI18n();
  const name = getCollectorName();
  const [lots, setLots] = useState(0);
  const [value, setValue] = useState(0);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    if (!name) return;
    fetchTransactionsByCollector(name).then((txns) => {
      setLots(txns.length);
      setValue(txns.reduce((s, x) => s + (x.estimated_value || 0), 0));
      setPending(txns.filter((x) => x.payment_status === "pending").length);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const stats = [
    { label: t.home.statLots, value: String(lots), icon: Boxes },
    { label: t.home.statValue, value: "₹" + value.toLocaleString("en-IN"), icon: Coins },
    { label: t.home.statPending, value: String(pending), icon: Timer },
  ];

  const actions = [
    { to: "/collector/new-lot", label: t.home.createLot, desc: t.home.createLotDesc, icon: PlusCircle },
    { to: "/collector/prices", label: t.home.priceBoard, desc: t.home.priceBoardDesc, icon: TrendingUp },
    { to: "/collector/ledger", label: t.home.myLedger, desc: t.home.myLedgerDesc, icon: BookOpen },
    { to: "/collector/trace", label: t.home.trace, desc: t.home.traceDesc, icon: Route },
    { to: "/collector/safety", label: t.home.safety, desc: t.home.safetyDesc, icon: ShieldAlert },
  ];

  return (
    <div className="space-y-5">
      {/* Greeting + Hero */}
      <div>
        <h1 className="text-lg font-semibold text-gray-500">
          {name ? t.home.hi.replace("{name}", name) : t.home.welcome}
        </h1>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 p-5 text-white shadow-lg shadow-emerald-700/20">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-14 -right-6 h-36 w-36 rounded-full bg-teal-400/20" />
        <Recycle className="pointer-events-none absolute right-4 top-6 h-14 w-14 text-white/20" />

        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100">
          {t.home.heroKicker}
        </p>
        <h2 className="mt-1 text-2xl font-extrabold leading-tight">{t.home.heroTitle}</h2>
        <p className="mt-2 max-w-[15rem] text-sm text-emerald-50/90">{t.home.heroSub}</p>

        <Link
          to="/collector/new-lot"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 shadow-md transition active:scale-[0.98]"
        >
          <PlusCircle className="h-5 w-5" />
          {t.home.heroCta}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card card-pad flex flex-col gap-1.5">
            <Icon className="h-5 w-5 text-emerald-600" />
            <div className="text-lg font-extrabold text-gray-900">{value}</div>
            <div className="text-[11px] font-medium leading-tight text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        {actions.map(({ to, label, desc, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900">{label}</div>
              <div className="text-sm text-gray-500">{desc}</div>
            </div>
            <span className="text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-500">
              ›
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
