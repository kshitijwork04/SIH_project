import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllPrices, createMaterial } from "../../lib/data";
import { uploadPhoto } from "../../lib/upload";
import { getCollectorLang } from "../../lib/collector";
import { useI18n } from "../../lib/i18n";
import { speak } from "../../lib/speech";
import {
  CATEGORIES,
  CONDITIONS,
  SOURCE_TYPES,
  CATEGORY_INFO,
  type Price,
} from "../../lib/types";
import PhotoCapture from "../../components/PhotoCapture";
import Spinner from "../../components/Spinner";
import { Plus, Minus } from "lucide-react";

export default function NewLot() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("");
  const [subCategory, setSubCategory] = useState<string>("");
  const [condition, setCondition] = useState<string>(CONDITIONS[1]);
  const [sourceType, setSourceType] = useState<string>(SOURCE_TYPES[0]);
  const [description, setDescription] = useState<string>("");
  const [weight, setWeight] = useState<number>(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllPrices()
      .then(setPrices)
      .finally(() => setLoading(false));
  }, []);

  const rate = useMemo(() => {
    const rows = prices
      .filter((p) => p.category === category)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    return rows[0]?.recycler_offered_price ?? 0;
  }, [prices, category]);

  useEffect(() => {
    setSubCategory(category ? (CATEGORY_INFO[category]?.hasSub[0] ?? "") : "");
  }, [category]);

  const estimated = rate * weight;

  function pickCategory(c: string) {
    setCategory(c);
    setSubCategory(CATEGORY_INFO[c]?.hasSub[0] ?? "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || weight <= 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const photoUrl = photo ? await uploadPhoto(photo) : null;
      const material = await createMaterial({
        category,
        sub_category: subCategory,
        description,
        condition,
        source_type: sourceType,
        weight,
        estimated_value: estimated,
        photo_url: photoUrl,
      });
      navigate(`/collector/recyclers?lot=${material.id}`, { state: { lot: material } });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.loading);
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="screen-title mb-4">{t.newLot.title}</h1>

      {loading ? (
        <Spinner />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section>
            <h2 className="label">{t.newLot.photo}</h2>
            {photo ? (
              <div className="relative overflow-hidden rounded-2xl">
                <img src={photo} alt="Lot" className="h-44 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute right-2 top-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white"
                >
                  {t.newLot.change}
                </button>
              </div>
            ) : (
              <PhotoCapture onCapture={setPhoto} />
            )}
          </section>

          <section>
            <h2 className="label">{t.newLot.category}</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORIES.map((c) => {
                const selected = c === category;
                const rows = prices.filter((p) => p.category === c).sort((a, b) => (a.date < b.date ? 1 : -1));
                const r = rows[0]?.recycler_offered_price ?? 0;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { pickCategory(c); speak(`${c}`, getCollectorLang()); }}
                    className={`rounded-2xl border-2 p-3 text-left transition ${
                      selected
                        ? "border-emerald-500 bg-emerald-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="text-sm font-bold text-gray-900">{c}</div>
                    <div className="mt-0.5 text-xs font-medium text-emerald-700">
                      {r > 0 ? `₹${r}/kg` : t.newLot.noRate}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {category && (
            <section className="space-y-4">
              <div>
                <label className="label">{t.newLot.subCategory}</label>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="input"
                >
                  {(CATEGORY_INFO[category]?.hasSub ?? []).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{t.newLot.condition}</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="input px-3"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">{t.newLot.sourceType}</label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                    className="input px-3"
                  >
                    {SOURCE_TYPES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">
                  {t.newLot.description} ({t.common.optional})
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.newLot.descriptionPlaceholder}
                  rows={2}
                  className="input"
                />
              </div>
            </section>
          )}

          <section>
            <h2 className="label">{t.newLot.weight}</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setWeight((w) => Math.max(0.5, +(w - 0.5).toFixed(1)))}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-gray-200 bg-white text-gray-600 transition active:scale-95"
              >
                <Minus className="h-5 w-5" />
              </button>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="input h-12 flex-1 text-center text-lg font-semibold"
              />
              <button
                type="button"
                onClick={() => setWeight((w) => +(w + 0.5).toFixed(1))}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-gray-200 bg-white text-gray-600 transition active:scale-95"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </section>

          <section className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
            <div className="text-sm font-medium text-gray-600">
              {t.newLot.estimated.replace("{rate}", rate.toFixed(2)).replace("{weight}", String(weight))}
            </div>
            <div className="mt-0.5 text-3xl font-extrabold text-emerald-700">
              ₹{estimated.toFixed(2)}
            </div>
          </section>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          {!category && <p className="text-sm font-medium text-amber-600">{t.newLot.selectCategory}</p>}

          <button
            type="submit"
            disabled={!category || weight <= 0 || submitting}
            className="btn-brand w-full py-4 text-base"
          >
            {submitting ? t.newLot.saving : t.newLot.submit}
          </button>
        </form>
      )}
    </div>
  );
}
