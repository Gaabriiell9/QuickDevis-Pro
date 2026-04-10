import { cn } from "@/lib/utils/cn";
import { QUOTE_STATUS_LABELS } from "@/lib/constants/quote-status";
import { INVOICE_STATUS_LABELS } from "@/lib/constants/invoice-status";

const CREDIT_NOTE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoye",
  APPLIED: "Applique",
  CANCELLED: "Annule",
};

interface StatusBadgeProps {
  status: string;
  type: "quote" | "invoice" | "credit-note";
}

const statusStyles: Record<string, string> = {
  DRAFT:          "bg-slate-100 text-slate-600",
  SENT:           "bg-blue-50 text-blue-700",
  ACCEPTED:       "bg-emerald-50 text-emerald-700",
  PAID:           "bg-emerald-50 text-emerald-700",
  APPLIED:        "bg-emerald-50 text-emerald-700",
  REJECTED:       "bg-red-50 text-red-700",
  CANCELLED:      "bg-red-50 text-red-600",
  EXPIRED:        "bg-orange-50 text-orange-700",
  OVERDUE:        "bg-orange-50 text-orange-700",
  PARTIALLY_PAID: "bg-amber-50 text-amber-700",
  REFUNDED:       "bg-purple-50 text-purple-700",
};

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const labels =
    type === "quote"
      ? QUOTE_STATUS_LABELS
      : type === "credit-note"
        ? CREDIT_NOTE_STATUS_LABELS
        : INVOICE_STATUS_LABELS;

  const label = labels[status] ?? status;
  const style = statusStyles[status] ?? "bg-slate-100 text-slate-600";

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", style)}>
      {label}
    </span>
  );
}
