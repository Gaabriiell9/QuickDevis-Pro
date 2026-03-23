import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  CheckCircle2,
  CircleDollarSign,
  AlertTriangle,
  Ban,
} from "lucide-react";
import { QUOTE_STATUS_LABELS } from "@/lib/constants/quote-status";
import { INVOICE_STATUS_LABELS } from "@/lib/constants/invoice-status";

const CREDIT_NOTE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  APPLIED: "Appliqué",
  CANCELLED: "Annulé",
};
import { cn } from "@/lib/utils/cn";

interface StatusBadgeProps {
  status: string;
  type: "quote" | "invoice" | "credit-note";
}

const statusConfig: Record<
  string,
  { color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  DRAFT: { color: "bg-slate-100 text-slate-600 border-slate-200", icon: Clock },
  SENT: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Send },
  ACCEPTED: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  REJECTED: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  EXPIRED: { color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertCircle },
  PAID: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  PARTIALLY_PAID: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: CircleDollarSign },
  OVERDUE: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
  CANCELLED: { color: "bg-slate-100 text-slate-500 border-slate-200", icon: Ban },
  REFUNDED: { color: "bg-purple-100 text-purple-700 border-purple-200", icon: CheckCircle2 },
};

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const labels =
    type === "quote"
      ? QUOTE_STATUS_LABELS
      : type === "credit-note"
        ? CREDIT_NOTE_STATUS_LABELS
        : INVOICE_STATUS_LABELS;
  const label = labels[status] ?? status;
  const config = statusConfig[status] ?? {
    color: "bg-slate-100 text-slate-600 border-slate-200",
    icon: Clock,
  };
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 font-medium text-xs px-2 py-0.5", config.color)}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
