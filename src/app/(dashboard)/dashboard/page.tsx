"use client";

import { motion } from "framer-motion";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils/money";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateShort } from "@/lib/utils/dates";
import {
  TrendingUp,
  FileText,
  Receipt,
  AlertCircle,
  Target,
  Plus,
  UserPlus,
  ArrowUpRight,
} from "lucide-react";
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
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      description: "Factures encaissees ce mois",
      trend: null,
    },
    {
      label: "Devis en cours",
      value: String(summary?.devisEnCours ?? 0),
      icon: FileText,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      description: "En attente de reponse",
      trend: null,
    },
    {
      label: "Factures impayees",
      value: formatMoney(summary?.montantEnAttente ?? 0),
      icon: AlertCircle,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      description: "Solde restant du",
      trend: null,
    },
    {
      label: "Taux de conversion",
      value: summary?.tauxConversion != null ? `${summary.tauxConversion}%` : "—",
      icon: Target,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      description: "Devis acceptes / envoyes",
      trend: null,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-0.5">Vue d&apos;ensemble de votre activite</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1.5">
            <Link href="/quotes/new">
              <Plus size={14} />
              Nouveau devis
            </Link>
          </Button>
          <Button asChild size="sm" className="h-8 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700">
            <Link href="/invoices/new">
              <Plus size={14} />
              Nouvelle facture
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05, ease: "easeOut" }}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.iconBg}`}>
                  <Icon className={`h-4 w-4 ${kpi.iconColor}`} />
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="h-7 w-24 mb-1" />
              ) : (
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{kpi.value}</p>
              )}
              <p className="text-xs text-slate-400 mt-1">{kpi.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Chart + Quick actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Chiffre d&apos;affaires</h2>
            <p className="text-xs text-slate-400">12 derniers mois — factures encaissees</p>
          </div>
          {isLoading ? (
            <Skeleton className="h-52" />
          ) : (
            <ResponsiveContainer width="100%" height={208}>
              <AreaChart data={summary?.monthlyRevenue ?? []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  formatter={(v) => [formatMoney(Number(v)), "Encaisse"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  labelStyle={{ fontWeight: 600, color: "#0f172a" }}
                />
                <Area type="monotone" dataKey="encaisse" stroke="#4F46E5" strokeWidth={2} fill="url(#gradCA)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">Actions rapides</h2>
          {[
            { href: "/quotes/new",   icon: FileText,  label: "Nouveau devis",    desc: "Cree et envoie en 2 min",   iconBg: "bg-indigo-50",  iconColor: "text-indigo-600"  },
            { href: "/invoices/new", icon: Receipt,   label: "Nouvelle facture", desc: "Facture un client",         iconBg: "bg-slate-50",   iconColor: "text-slate-600"   },
            { href: "/clients/new",  icon: UserPlus,  label: "Nouveau client",   desc: "Ajoute au portefeuille",    iconBg: "bg-slate-50",   iconColor: "text-slate-600"   },
          ].map(({ href, icon: Icon, label, desc, iconBg, iconColor }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 border-dashed hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg} shrink-0`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent documents */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Documents recents</h2>
          <Link href="/documents" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            Voir tout
          </Link>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : summary?.recentDocuments?.length ? (
          <div className="divide-y divide-slate-50">
            {summary.recentDocuments.map((doc: any) => (
              <div key={doc.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 shrink-0">
                  {doc.docType === "quote" ? (
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                  ) : (
                    <Receipt className="h-3.5 w-3.5 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/${doc.docType === "quote" ? "quotes" : "invoices"}/${doc.id}`}
                    className="text-sm font-medium text-slate-800 hover:text-indigo-600 transition-colors font-mono"
                  >
                    {doc.reference}
                  </Link>
                  <p className="text-xs text-slate-400 truncate">
                    {doc.client?.companyName ?? `${doc.client?.firstName ?? ""} ${doc.client?.lastName ?? ""}`.trim()}
                  </p>
                </div>
                <StatusBadge status={doc.status} type={doc.docType} />
                <span className="text-sm font-semibold text-slate-800 tabular-nums shrink-0">
                  {formatMoney(Number(doc.total))}
                </span>
                <span className="text-xs text-slate-400 shrink-0 hidden sm:block">
                  {formatDateShort(doc.createdAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <FileText className="h-8 w-8 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Aucun document recent</p>
            <Link href="/quotes/new" className="mt-3 inline-flex">
              <Button size="sm" className="mt-3 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-2 h-4 w-4" />
                Creer un devis
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
