import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Recycle, ChevronRight } from "lucide-react";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useApp } from "../../lib/store";
import { repoWrite } from "../../lib/repository";

export default function Onboarding() {
  const { t } = useApp();
  const nav = useNavigate();
  const [step, setStep] = useState<"language" | "area">("language");
  const [area, setArea] = useState("");

  const finish = () => {
    repoWrite.completeOnboarding(
      area.trim() || "Okhla, Delhi",
      28.5431,
      77.2639
    );
    nav("/home", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-brand-900 via-brand-800 to-brand-700 p-5 text-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-700">
            <Recycle size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {t("appName")}
            </h1>
            <p className="text-sm text-brand-100">{t("tagline")}</p>
          </div>
        </div>

        {step === "language" ? (
          <>
            <h2 className="mb-4 text-center text-lg font-semibold">
              {t("languagePrompt")}
            </h2>
            <LanguageSwitcher large />
            <button
              onClick={() => setStep("area")}
              className="btn-primary mt-8 w-full"
            >
              {t("next")} <ChevronRight size={20} />
            </button>
          </>
        ) : (
          <>
            <h2 className="mb-2 text-lg font-semibold">{t("yourArea")}</h2>
            <p className="mb-4 text-sm text-brand-100">
              {t("enterArea")} — {t("enterName")}
            </p>
            <label className="mb-1 block text-sm">{t("yourArea")}</label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
              <input
                autoFocus
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Okhla, Delhi"
                className="w-full rounded-2xl bg-white px-4 py-3 pl-10 text-base text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
            <button onClick={finish} className="btn-gold mt-6 w-full">
              {t("start")} <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
