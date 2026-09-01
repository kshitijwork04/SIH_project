import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home as HomeIcon,
  BadgeIndianRupee,
  LineChart,
  ShieldCheck,
  PlusCircle,
  ArrowLeftRight,
  Menu,
} from "lucide-react";
import { useApp } from "../../lib/store";
import SyncBanner from "../../components/SyncBanner";

const NAV = [
  { to: "/home", key: "home", icon: HomeIcon },
  { to: "/prices", key: "priceBoard", icon: LineChart },
  { to: "/new-lot", key: "newLot", icon: PlusCircle, primary: true },
  { to: "/ledger", key: "myEarnings", icon: BadgeIndianRupee },
  { to: "/safety", key: "safety", icon: ShieldCheck },
];

export default function CollectorShell() {
  const { t } = useApp();
  const nav = useNavigate();

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col bg-ink-50">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-ink-100 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <ArrowLeftRight size={18} />
            </span>
            <div>
              <p className="text-base font-extrabold leading-tight text-brand-800">
                {t("appName")}
              </p>
              <p className="text-2xs font-medium text-ink-400">
                {t("collectorView")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => nav("/recycler")}
              className="btn-outline px-3 py-1.5 text-xs"
            >
              <ArrowLeftRight size={14} />
              {t("recyclerView")}
            </button>
            <button className="btn-ghost p-2" aria-label="menu">
              <Menu size={20} />
            </button>
          </div>
        </div>
        <SyncBanner />
      </header>

      {/* Content */}
      <main className="flex-1 px-4 pb-28 pt-4">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-100 bg-white">
        <div className="mx-auto grid max-w-2xl grid-cols-5 pb-2 pt-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/home"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-2xs font-medium transition-colors ${
                  item.primary
                    ? "text-brand-700"
                    : isActive
                      ? "text-brand-700"
                      : "text-ink-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex items-center justify-center rounded-full ${
                      item.primary
                        ? "h-12 w-12 -mt-5 bg-brand-600 text-white shadow-lg"
                        : isActive
                          ? "bg-brand-100 text-brand-700 h-8 w-8"
                          : "h-8 w-8"
                    }`}
                  >
                    <item.icon size={item.primary ? 24 : 20} />
                  </span>
                  {!item.primary && t(item.key as any)}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
