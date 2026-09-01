import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setCollectorName, getCollectorLang } from "../../lib/collector";
import { saveCollectorProfile } from "../../lib/data";
import { setLang } from "../../lib/langStore";
import { Recycle } from "lucide-react";
import { LANGS, useI18n } from "../../lib/i18n";
import type { Lang } from "../../lib/types";

export default function EnterName() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [lang, setLocalLang] = useState<Lang>(getCollectorLang());
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  function chooseLang(code: Lang) {
    setLocalLang(code);
    setLang(code);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const clean = name.trim();
    setCollectorName(clean);
    setLang(lang);
    // Step 2.6 — store minimal profile (language + general area only).
    await saveCollectorProfile({
      id: clean,
      preferred_language: lang,
      general_operating_location: location.trim(),
    });
    navigate("/collector", { replace: true });
  }

  return (
    <div className="flex flex-col items-center pt-6">
      {/* Logo mark */}
      <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-600/30">
        <Recycle className="h-10 w-10 text-white" />
      </div>
      <h1 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-gray-900">
        {t.enter.welcome}
      </h1>
      <p className="mt-1.5 mb-6 max-w-xs text-center text-sm text-gray-500">
        {t.enter.subtitle}
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-5">
        <div>
          <label className="label">Language</label>
          <div className="grid grid-cols-3 gap-2">
            {LANGS.map((l) => {
              const selected = l.code === lang;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => chooseLang(l.code)}
                  className={`select-pill ${
                    selected
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {l.native}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="label">{t.enter.yourName}</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.enter.yourName}
            className="input"
          />
        </div>

        <div>
          <label className="label">{t.enter.operatingLocation}</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t.enter.operatingLocationPlaceholder}
            className="input"
          />
        </div>

        <button type="submit" disabled={!name.trim()} className="btn-brand w-full py-3.5 text-base">
          {t.enter.continue}
        </button>
      </form>
    </div>
  );
}
