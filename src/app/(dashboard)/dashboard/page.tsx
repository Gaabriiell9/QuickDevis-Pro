"use client";

import { motion } from "framer-motion";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils/money";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateShort } from "@/lib/utils/dates";
import { TrendingUp, FileText, Receipt, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const { data: summary, isLoading } = useDashboardSummary();

  const kpis = [
    {
      label: "CA du mois",
      value: formatMoney(summary?.caMois ?? 0),
      icon: TrendingUp,
      description: "Factures encaissées ce mois",
    },
    {
      label: "CA de l'année",
      value: formatMoney(summary?.caAnnee ?? 0),
      icon: TrendingUp,
      description: "Factures encaissées cette année",
    },
    {
      label: "En attente",
      value: formatMoney(summary?.montantEnAttente ?? 0),
      icon: Receipt,
      description: "Solde restant dû",
    },
    {
      label: "En retard",
      value: String(summary?.facturesRetard ?? 0),
      icon: AlertCircle,
      description: "Factures échues non payées",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        action={
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link href="/quotes/new">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau devis
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/invoices/new">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle facture
              </Link>
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06, ease: "easeOut" }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-2xl font-bold"
                    >
                      {kpi.value}
                    </motion.div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {kpi.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Chart placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Chiffre d&apos;affaires (12 derniers mois)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <ResponsiveContainer width="100%" height={256}>
              <AreaChart data={summary?.monthlyRevenue ?? []}>
                <defs>
                  <linearGradient id="gradEncaisse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => formatMoney(Number(v))} labelStyle={{ fontWeight: 600 }} />
                <Area
                  type="monotone"
                  dataKey="encaisse"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#gradEncaisse)"
                  name="Encaissé"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documents récents</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : summary?.recentDocuments?.length ? (
            <div className="space-y-2">
              {summary.recentDocuments.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {doc.docType === "quote" ? (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{doc.reference}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.client?.companyName ?? `${doc.client?.firstName} ${doc.client?.lastName}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={doc.status} type={doc.docType} />
                    <span className="text-sm font-medium">
                      {formatMoney(Number(doc.total))}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateShort(doc.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Aucun document récent.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
