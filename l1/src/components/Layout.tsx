import { Outlet, NavLink, Link } from "react-router-dom";
import {
  CircleGauge,
  PlusCircle,
  TrendingUp,
  BookOpen,
  ShieldAlert,
  Recycle,
} from "lucide-react";
import { useI18n, LANGS } from "../lib/i18n";
import { setLang } from "../lib/langStore";
import type { Lang } from "../lib/types";

export default function Layout() {
  const { t, lang } = useI18n();

  const navItems = [
    { to: "/collector", label: t.nav.home, icon: CircleGauge, end: true },
    { to: "/collector/new-lot", label: t.nav.newLot, icon: PlusCircle, end: false },
    { to: "/collector/prices", label: t.nav.prices, icon: TrendingUp, end: false },
    { to: "/collector/ledger", label: t.nav.ledger, icon: BookOpen, end: false },
    { to: "/collector/safety", label: t.nav.safety, icon: ShieldAlert, end: false },
  ];

  function switchLang(code: Lang) {
    setLang(code);
  }

  return (
    <div className="min-h-screen">
      {/* Top header with gradient */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 shadow-lg shadow-emerald-900/10">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Link to="/collector" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <Recycle className="h-5 w-5 text-white" />
            </span>
            <div className="leading-tight">
              <div className="text-base font-extrabold tracking-tight text-white">
                {t.appName}
              </div>
              <div className="text-[11px] font-medium text-emerald-100/90">
                {t.tagline}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={lang}
                onChange={(e) => switchLang(e.target.value as Lang)}
                className="appearance-none rounded-lg border border-white/25 bg-white/10 py-1.5 pl-3 pr-7 text-sm font-semibold text-white outline-none backdrop-blur transition focus:bg-white/20"
                aria-label="Language"
              >
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code} className="bg-white text-gray-800">
                    {l.native}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/80">
                ▾
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pb-28 pt-4">
        <Outlet />
      </main>

      {/* Elevated floating bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
        <div className="mx-auto max-w-md px-4">
          <div className="flex items-stretch justify-around rounded-2xl border border-gray-100 bg-white/95 px-1 py-1.5 shadow-xl shadow-gray-900/10 backdrop-blur">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold transition-colors ${
                    isActive ? "text-emerald-700" : "text-gray-400 hover:text-gray-600"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`grid h-9 w-12 place-items-center rounded-xl transition-all ${
                        isActive ? "bg-emerald-100 text-emerald-700" : "text-gray-400"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
