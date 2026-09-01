import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeftRight, LogIn, ArrowLeft } from "lucide-react";
import { useApp } from "../../lib/store";

// Recycler auth is intentionally simple/mocked for the demo (section 9).
// Any non-empty credentials log into the demo recycler. Swapped for real
// Supabase Auth later.

export default function RecyclerLogin() {
  const { t } = useApp();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(t("loginRequired"));
      return;
    }
    nav("/recycler/inbox");
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <header className="flex items-center justify-between border-b border-ink-100 bg-white px-4 py-3">
        <Link to="/" className="btn-ghost px-2 py-1 text-sm">
          <ArrowLeft size={16} /> {t("collectorView")}
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <ArrowLeftRight size={18} />
          </span>
          <p className="font-extrabold text-brand-800">{t("recyclerDashboard")}</p>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center p-5">
        <div className="card">
          <h1 className="mb-1 text-xl font-extrabold text-ink-800">
            {t("login")}
          </h1>
          <p className="mb-5 text-xs text-ink-400">
            {t("demoLoginNote")}
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">{t("email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="recycler@greencycle.in"
              />
            </div>
            <div>
              <label className="label">{t("password")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
            <button type="submit" className="btn-primary w-full">
              <LogIn size={18} /> {t("login")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
