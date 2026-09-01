import { useI18n } from "../lib/i18n";

export default function Spinner() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-500">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      <span className="text-sm">{t.common.loading}</span>
    </div>
  );
}
