import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { APP_NAME } from "@/config/app";
import { AuthAnimatedWrapper } from "@/components/shared/auth-animated-wrapper";

// ─── Mock dashboard background (purely decorative) ───────────────────────────

function MockAppBackground() {
  return (
    <div className="absolute inset-0 flex bg-[#f8fafc]">
      {/* Sidebar */}
      <div className="w-56 shrink-0 bg-[#111827] flex flex-col">
        <div className="h-16 flex items-center gap-3 px-4 border-b border-[#1f2d3d]">
          <div className="size-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            QD
          </div>
          <div>
            <p className="text-sm font-semibold text-white">QuickDevis Pro</p>
            <p className="text-xs text-gray-400">v1.0</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-5 overflow-hidden">
          {[
            {
              title: "Principal",
              items: [{ name: "Tableau de bord", active: true }],
            },
            {
              title: "Commercial",
              items: [
                { name: "Clients" },
                { name: "Devis" },
                { name: "Factures" },
                { name: "Paiements" },
              ],
            },
            {
              title: "Catalogue",
              items: [
                { name: "Produits & Services" },
                { name: "Templates", locked: true },
              ],
            },
            {
              title: "Analyse",
              items: [{ name: "Analytiques", locked: true }],
            },
          ].map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <div
                    key={item.name}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                      "active" in item && item.active
                        ? "bg-indigo-600 text-white"
                        : "text-gray-300"
                    }`}
                  >
                    <div
                      className={`size-4 rounded shrink-0 ${
                        "active" in item && item.active
                          ? "bg-indigo-300/30"
                          : "bg-gray-600/40"
                      }`}
                    />
                    <span className="flex-1 truncate">{item.name}</span>
                    {"locked" in item && item.locked && (
                      <span className="text-[9px] bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded-full">
                        Pro
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#1f2d3d] p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="size-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-medium shrink-0">
              ML
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                Marie Lefebvre
              </p>
              <p className="text-xs text-gray-400 truncate">marie@studio.fr</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
          <div>
            <p className="text-base font-semibold text-slate-800">
              Tableau de bord
            </p>
            <p className="text-xs text-slate-400">Bienvenue, Marie</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-36 rounded-lg bg-slate-100" />
            <div className="size-8 rounded-full bg-indigo-100" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-5 overflow-hidden">
          {/* KPI row */}
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                label: "CA encaissé",
                value: "24 850 €",
                sub: "+12% ce mois",
                color: "text-emerald-600",
              },
              {
                label: "Devis en cours",
                value: "8",
                sub: "3 à relancer",
                color: "text-amber-600",
              },
              {
                label: "Factures impayées",
                value: "3 450 €",
                sub: "2 en retard",
                color: "text-rose-600",
              },
              {
                label: "Taux conversion",
                value: "68 %",
                sub: "Devis acceptés",
                color: "text-indigo-600",
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-medium text-slate-400 mb-2">
                  {kpi.label}
                </p>
                <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
                <p className={`text-xs font-medium mt-1 ${kpi.color}`}>
                  {kpi.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Chart + pie row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-700 mb-4">
                Chiffre d&apos;affaires mensuel
              </p>
              <div className="flex items-end gap-1.5 h-24">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map(
                  (h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t-sm ${i === 11 ? "bg-indigo-600" : "bg-indigo-100"}`}
                      style={{ height: `${h}%` }}
                    />
                  )
                )}
              </div>
              <div className="flex justify-between mt-2">
                {[
                  "Avr",
                  "Mai",
                  "Jui",
                  "Jul",
                  "Aoû",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Déc",
                  "Jan",
                  "Fév",
                  "Mar",
                ].map((m) => (
                  <span
                    key={m}
                    className="text-[9px] text-slate-400 flex-1 text-center"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-700 mb-3">
                Répartition factures
              </p>
              <div className="flex items-center justify-center mb-3">
                <div className="relative size-20">
                  <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="5"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="5"
                      strokeDasharray="45 55"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="5"
                      strokeDasharray="30 70"
                      strokeDashoffset="-45"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="5"
                      strokeDasharray="15 85"
                      strokeDashoffset="-75"
                    />
                  </svg>
                </div>
              </div>
              <div className="space-y-1.5">
                {[
                  { color: "bg-emerald-500", label: "Payées", pct: "45%" },
                  { color: "bg-blue-500", label: "Envoyées", pct: "30%" },
                  { color: "bg-orange-500", label: "En retard", pct: "15%" },
                ].map((d) => (
                  <div key={d.label} className="flex items-center gap-2">
                    <div
                      className={`size-2 rounded-full shrink-0 ${d.color}`}
                    />
                    <span className="text-[10px] text-slate-500 flex-1">
                      {d.label}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-700">
                      {d.pct}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent docs table */}
          <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3">
              <p className="text-sm font-semibold text-slate-700">
                Documents récents
              </p>
            </div>
            {[
              {
                ref: "DEV-2025-047",
                client: "Dupont Architecture",
                amount: "3 200 €",
                status: "Envoyé",
                color: "bg-amber-100 text-amber-700",
              },
              {
                ref: "FAC-2025-031",
                client: "Martin & Associés",
                amount: "1 850 €",
                status: "Payée",
                color: "bg-emerald-100 text-emerald-700",
              },
              {
                ref: "DEV-2025-046",
                client: "Studio Leclerc",
                amount: "7 450 €",
                status: "Brouillon",
                color: "bg-slate-100 text-slate-600",
              },
              {
                ref: "FAC-2025-030",
                client: "Agence Nova",
                amount: "920 €",
                status: "En retard",
                color: "bg-rose-100 text-rose-700",
              },
            ].map((row) => (
              <div
                key={row.ref}
                className="flex items-center gap-4 px-5 py-3 border-b border-slate-50 last:border-0"
              >
                <span className="text-xs font-mono text-slate-600 w-28 shrink-0">
                  {row.ref}
                </span>
                <span className="text-xs text-slate-500 flex-1 truncate">
                  {row.client}
                </span>
                <span className="text-xs font-semibold text-slate-700 w-16 text-right shrink-0">
                  {row.amount}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium shrink-0 ${row.color}`}
                >
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background: simulated dashboard */}
      <MockAppBackground />

      {/* Blur + dim overlay */}
      <div className="pointer-events-none absolute inset-0 bg-slate-900/50 backdrop-blur-md" />

      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white hover:bg-white/10"
      >
        <ArrowLeft className="size-4" />
        Accueil
      </Link>

      {/* Auth card */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {APP_NAME}
            </h1>
            <p className="text-sm text-white/50 mt-1">
              Gestion de devis et factures
            </p>
          </div>
          <AuthAnimatedWrapper>{children}</AuthAnimatedWrapper>
        </div>
      </div>
    </div>
  );
}
