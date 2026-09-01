import { useI18n } from "../lib/i18n";
import type { TransactionStatus } from "../lib/types";

export default function StatusBadge({ status }: { status: TransactionStatus }) {
  const { t } = useI18n();
  const confirmed = status === "confirmed";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
        confirmed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {confirmed ? t.common.confirmed : t.common.pending}
    </span>
  );
}
