export const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  PAID: "Payée",
  PARTIALLY_PAID: "Partiellement payée",
  OVERDUE: "En retard",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  DRAFT: "secondary",
  SENT: "blue",
  PAID: "green",
  PARTIALLY_PAID: "orange",
  OVERDUE: "red",
  CANCELLED: "gray",
  REFUNDED: "purple",
};
