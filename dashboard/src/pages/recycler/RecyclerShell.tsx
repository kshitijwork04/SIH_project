import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowLeftRight, Inbox as InboxIcon, ArrowLeft } from "lucide-react";
import { useApp } from "../../lib/store";
import { repo } from "../../lib/repository";
import { useRepoSync } from "../../lib/useRepoSync";
import SyncBanner from "../../components/SyncBanner";

export default function RecyclerShell() {
  const { t } = useApp();
  const loc = useLocation();
  useRepoSync();
  const recycler = repo.getRecyclers()[0];

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col bg-ink-50">
      <header className="sticky top-0 z-20 border-b border-ink-100 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <ArrowLeftRight size={18} />
            </span>
            <div>
              <p className="text-base font-extrabold leading-tight text-brand-800">
                {t("recyclerDashboard")}
              </p>
              <p className="text-2xs font-medium text-ink-400">
                {recycler.name} · {recycler.authorization_status}
              </p>
            </div>
          </div>
          <Link to="/" className="btn-outline px-3 py-1.5 text-xs">
            <ArrowLeft size={14} /> {t("collectorView")}
          </Link>
        </div>
        <SyncBanner />
        <nav className="flex gap-1 px-2 py-1.5">
          <Link
            to="/recycler/inbox"
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${
              loc.pathname.includes("inbox")
                ? "bg-brand-600 text-white"
                : "text-ink-600 hover:bg-ink-100"
            }`}
          >
            <InboxIcon size={16} /> {t("incomingLots")}
          </Link>
        </nav>
      </header>
      <main className="flex-1 px-4 py-4">
        <Outlet />
      </main>
    </div>
  );
}
