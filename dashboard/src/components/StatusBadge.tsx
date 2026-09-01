import type { TransactionStatus } from "../lib/types";
import { useApp } from "../lib/store";

const STYLE: Record<TransactionStatus, string> = {
  created: "bg-ink-100 text-ink-700",
  matched: "bg-brand-100 text-brand-700",
  "in-transit": "bg-sky-100 text-sky-700",
  "handed-over": "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-brand-600 text-white",
};

const KEY: Record<TransactionStatus, string> = {
  created: "created",
  matched: "matched",
  "in-transit": "inTransit",
  "handed-over": "handedOver",
  confirmed: "confirmed",
  completed: "completed",
} as const;

export function StatusBadge({ status }: { status: TransactionStatus }) {
  const { t } = useApp();
  return (
    <span className={`badge ${STYLE[status]}`}>
      {t(KEY[status] as Parameters<typeof t>[0])}
    </span>
  );
}
