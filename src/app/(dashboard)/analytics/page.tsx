"use client";

import { useDashboardSummary } from "@/hooks/use-dashboard-summary";
import { useInvoices } from "@/hooks/use-invoices";
import { useQuotes } from "@/hooks/use-quotes";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/utils/money";
import { TrendingUp, Target, Clock } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const INVOICE_STATUS_COLORS: Record<string, string> = {
  DRAFT: "#94a3b8",
  SENT: "#3b82f6",
  PAID: "#22c55e",
  PARTIALLY_PAID: "#f97316",
  OVERDUE: "#ef4444",
  CANCELLED: "#6b7280",
};

const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  PAID: "Payée",
  PARTIALLY_PAID: "Part. payée",
  OVERDUE: "En retard",
  CANCELLED: "Annulée",
};

const QUOTE_STATUS_COLORS: Record<string, string> = {
  DRAFT: "#94a3b8",
  SENT: "#3b82f6",
  ACCEPTED: "#22c55e",
  REJECTED: "#ef4444",
  EXPIRED: "#f97316",
  CANCELLED: "#6b7280",
};

const QUOTE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  ACCEPTED: "Accepté",
  REJECTED: "Refusé",
  EXPIRED: "Expiré",
  CANCELLED: "Annulé",
};

export default function AnalyticsPage() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();

  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices({ pageSize: 100 } as any);
  const { data: quotesData, isLoading: quotesLoading } = useQuotes({ pageSize: 100 } as any);

  const isLoading = summaryLoading || invoicesLoading || quotesLoading;

  // Build invoice status distribution for pie chart
  const invoiceStatusMap: Record<string, number> = {};
  (invoicesData?.data ?? []).forEach((inv: any) => {
    invoiceStatusMap[inv.status] = (invoiceStatusMap[inv.status] ?? 0) + 1;
  });
  const invoicePieData = Object.entries(invoiceStatusMap).map(([status, count]) => ({
    name: INVOICE_STATUS_LABELS[status] ?? status,
    value: count,
    color: INVOICE_STATUS_COLORS[status] ?? "#94a3b8",
  }));

  // Build quote status distribution
  const quoteStatusMap: Record<string, number> = {};
  (quotesData?.data ?? []).forEach((q: any) => {
    quoteStatusMap[q.status] = (quoteStatusMap[q.status] ?? 0) + 1;
  });
  const quotePieData = Object.entries(quoteStatusMap).map(([status, count]) => ({
    name: QUOTE_STATUS_LABELS[status] ?? status,
    value: count,
    color: QUOTE_STATUS_COLORS[status] ?? "#94a3b8",
  }));

  // Monthly revenue bar chart (last 6 months placeholder from invoices)
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    const monthInvoices = (invoicesData?.data ?? []).filter((inv: any) => {
      if (inv.status !== "PAID" || !inv.paidAt) return false;
      const paid = new Date(inv.paidAt);
      return paid.getMonth() === d.getMonth() && paid.getFullYear() === d.getFullYear();
    });
    const total = monthInvoices.reduce((sum: number, inv: any) => sum + Number(inv.total), 0);
    return { month: label, ca: total };
  });

  const kpis = [
    {
      label: "CA encaissé (année)",
      value: formatMoney(summary?.caAnnee ?? 0),
      icon: TrendingUp,
      description: "Factures payées cette année",
    },
    {
      label: "Taux de conversion",
      value: `${summary?.tauxConversion ?? 0} %`,
      icon: Target,
      description: "Devis acceptés / devis envoyés",
    },
    {
      label: "En attente",
      value: formatMoney(summary?.montantEnAttente ?? 0),
      icon: Clock,
      description: "Montant total à encaisser",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytiques"
        description="Vue d'ensemble de vos performances commerciales"
      />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-7 w-28" />
                ) : (
                  <div className="text-2xl font-bold">{kpi.value}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Monthly revenue bar chart */}
      <Card>
        <CardHeader>
          <CardTitle>Chiffre d&apos;affaires mensuel (6 derniers mois)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatMoney(Number(v))} />
                <Bar dataKey="ca" fill="#3b82f6" name="CA encaissé" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Pie charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des factures</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56" />
            ) : invoicePieData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height={224}>
                <PieChart>
                  <Pie
                    data={invoicePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {invoicePieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} facture${Number(v) > 1 ? "s" : ""}`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des devis</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56" />
            ) : quotePieData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height={224}>
                <PieChart>
                  <Pie
                    data={quotePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {quotePieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} devis`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
