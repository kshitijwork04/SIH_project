import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Minus,
  Plus,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { useApp } from "../../lib/store";
import { repo, repoWrite } from "../../lib/repository";
import { useRepoSync } from "../../lib/useRepoSync";
import CategoryIcon from "../../components/CategoryIcon";
import { estimateValue, CATEGORY_LABELS } from "../../lib/engine";
import { formatRupee } from "../../lib/format";
import type { Condition, MaterialCategory } from "../../lib/types";
import type { I18nKey } from "../../lib/i18n";

const CATEGORIES: MaterialCategory[] = [
  "crt",
  "lcd",
  "pcb",
  "cables",
  "batteries",
  "motors",
  "plastics",
];

const CONDITIONS: { value: Condition; key: I18nKey }[] = [
  { value: "intact", key: "condIntact" },
  { value: "damaged", key: "condDamaged" },
  { value: "degraded", key: "heavilyDegraded" },
];

function ConditionLabel({ value }: { value: Condition }) {
  const { t } = useApp();
  return <>{t(CONDITIONS.find((c) => c.value === value)?.key ?? "condIntact")}</>;
}

export default function NewLot() {
  const { t } = useApp();
  const nav = useNavigate();
  useRepoSync();
  const location = repo.getCollector().general_operating_location;
  const prices = repo.getPrices();

  const [category, setCategory] = useState<MaterialCategory | null>(null);
  const [weight, setWeight] = useState(1);
  const [condition, setCondition] = useState<Condition>("intact");
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState("");

  const estimate = useMemo(() => {
    if (!category) return 0;
    return estimateValue(prices, category, location, weight, condition);
  }, [category, weight, condition, prices, location]);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 3);
    const readers = arr.map(
      (f) =>
        new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.readAsDataURL(f);
        })
    );
    Promise.all(readers).then((results) =>
      setPhotos((prev) => [...prev, ...results].slice(0, 3))
    );
  };

  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!category) {
      setError("selectCategory");
      return;
    }
    const tx = repoWrite.createLot({
      category,
      weight,
      condition,
      photographs: photos,
    });
    nav(`/match/${tx.lot_id}`);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-extrabold text-ink-800">{t("newLot")}</h1>

      {/* Photos */}
      <section>
        <p className="label">{t("takePhoto")}</p>
        <div className="flex gap-3">
          {photos.map((p, i) => (
            <div
              key={i}
              className="relative h-20 w-20 overflow-hidden rounded-xl border border-ink-200"
            >
              <img src={p} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                className="absolute right-0 top-0 rounded-bl-lg bg-red-500 p-1 text-white"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {photos.length < 3 && (
            <>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink-200 text-ink-400"
              >
                <Camera size={22} />
                <span className="text-2xs">{t("photo")}</span>
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink-200 text-ink-400"
              >
                <ImageIcon size={22} />
                <span className="text-2xs">{t("gallery")}</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
              />
            </>
          )}
        </div>
      </section>

      {/* Category */}
      <section>
        <p className="label">{t("selectCategory")}</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-3 text-center transition-colors ${
                  active
                    ? "border-brand-600 bg-brand-50"
                    : "border-ink-200 bg-white hover:border-brand-400"
                }`}
              >
                <CategoryIcon
                  category={c}
                  size={28}
                  className={active ? "text-brand-700" : "text-ink-500"}
                />
                <span
                  className={`text-2xs font-semibold ${
                    active ? "text-brand-800" : "text-ink-600"
                  }`}
                >
                  {CATEGORY_LABELS[c]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Weight stepper */}
      <section>
        <p className="label">{t("weightKg")}</p>
        <div className="flex items-center justify-between rounded-2xl border-2 border-ink-200 bg-white p-2">
          <button
            onClick={() => setWeight((w) => Math.max(0.5, +(w - 0.5).toFixed(1)))}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-100 text-ink-700"
          >
            <Minus size={22} />
          </button>
          <span className="text-3xl font-extrabold text-ink-900">
            {weight} <span className="text-base font-semibold text-ink-400">kg</span>
          </span>
          <button
            onClick={() => setWeight((w) => +(w + 0.5).toFixed(1))}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white"
          >
            <Plus size={22} />
          </button>
        </div>
      </section>

      {/* Condition */}
      <section>
        <p className="label">{t("condition")}</p>
        <div className="grid grid-cols-3 gap-2">
          {CONDITIONS.map((c) => (
            <button
              key={c.value}
              onClick={() => setCondition(c.value)}
              className={`rounded-xl border-2 px-2 py-3 text-sm font-semibold ${
                condition === c.value
                  ? "border-brand-600 bg-brand-50 text-brand-800"
                  : "border-ink-200 bg-white text-ink-600"
              }`}
            >
              <ConditionLabel value={c.value} />
            </button>
          ))}
        </div>
      </section>

      {/* Estimated value */}
      {category && (
        <section className="card flex items-center justify-between bg-brand-50">
          <div>
            <p className="text-sm text-brand-700">{t("estimatedValue")}</p>
            <p className="text-3xl font-extrabold text-brand-800">
              {formatRupee(estimate)}
            </p>
          </div>
          <CheckCircle2 size={32} className="text-brand-600" />
        </section>
      )}

      {error && <p className="text-sm font-semibold text-red-500">{t(error as any)}</p>}

      <button onClick={submit} className="btn-primary w-full py-4 text-lg">
        {t("addLot")}
      </button>
    </div>
  );
}
