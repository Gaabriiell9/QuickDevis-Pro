export const PLAN_LIMITS = {
  FREE: { quotes: 5, invoices: 5, clients: 2 },
  PRO: { quotes: Infinity, invoices: Infinity, clients: Infinity },
  BUSINESS: { quotes: Infinity, invoices: Infinity, clients: Infinity },
} as const;
