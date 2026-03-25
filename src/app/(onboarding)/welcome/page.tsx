"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Sparkles, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Decorative right-side visual ────────────────────────────────────────────

function WelcomeVisual() {
  return (
    <div className="relative w-full max-w-[320px]">
      {/* Main invoice card */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">
              Facture
            </p>
            <p className="text-base font-bold text-slate-800">FAC-2025-001</p>
            <p className="text-sm text-slate-400">Studio Dupont</p>
          </div>
          <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
            Payée ✓
          </span>
        </div>

        <div className="space-y-2.5 mb-5">
          {[
            { label: "Développement web", price: "1 800 €" },
            { label: "Design UI/UX", price: "600 €" },
            { label: "Maintenance mensuelle", price: "150 €" },
          ].map((line) => (
            <div key={line.label} className="flex justify-between items-center">
              <span className="text-sm text-slate-500">{line.label}</span>
              <span className="text-sm font-medium text-slate-800">{line.price}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
          <span className="text-sm text-slate-400">Total TTC</span>
          <span className="text-xl font-extrabold text-slate-900">3 060 €</span>
        </div>
      </div>

      {/* Floating "paiement reçu" chip */}
      <div className="absolute -bottom-5 -left-6 bg-white rounded-xl shadow-xl px-3 py-2.5 flex items-center gap-2.5 z-20 border border-slate-100">
        <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <Check className="size-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-800">Paiement reçu</p>
          <p className="text-[11px] text-slate-400">3 060 € · maintenant</p>
        </div>
      </div>

      {/* Floating mini quote card */}
      <div className="absolute -top-5 -right-5 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3.5 w-44 z-20 border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            Devis
          </span>
          <span className="bg-amber-100 text-amber-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
            Envoyé
          </span>
        </div>
        <div className="h-2 w-20 bg-slate-200 rounded mb-1.5" />
        <div className="h-2 w-14 bg-slate-100 rounded mb-2.5" />
        <p className="text-sm font-bold text-slate-800">1 200 €</p>
      </div>

      {/* Floating client avatar row */}
      <div className="absolute top-1/2 -left-10 -translate-y-1/2 bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-1.5 z-20 border border-slate-100">
        {["TD", "ML", "SC"].map((initials, i) => (
          <div
            key={initials}
            className="size-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{
              background: ["#6366f1", "#8b5cf6", "#10b981"][i],
              marginLeft: i > 0 ? "-6px" : 0,
              zIndex: 3 - i,
            }}
          >
            {initials}
          </div>
        ))}
        <p className="text-[11px] font-semibold text-slate-600 ml-1">3 clients</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WelcomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const firstName = session?.user?.name?.split(" ")[0] ?? "là";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* ── Left column ── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-20 py-12 md:py-0">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-extrabold shadow">
            QD
          </div>
          <span className="font-bold text-slate-900 tracking-tight">QuickDevis Pro</span>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 mb-6 w-fit">
          <Sparkles className="size-3" />
          Essai Pro 14 jours offert — gratuit, sans carte
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
          Bienvenue,<br />
          <span className="text-indigo-600">{firstName}</span> 👋
        </h1>

        <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-md">
          Votre compte est prêt. Configurez votre espace en 2 minutes et créez
          vos premiers documents professionnels.
        </p>

        {/* Reassurance checkpoints */}
        <div className="space-y-3 mb-10">
          {[
            { icon: Shield, text: "Données conservées après l'essai" },
            { icon: RotateCcw, text: "Retour au plan gratuit possible à tout moment" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="size-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Icon className="size-3.5 text-emerald-600" />
              </div>
              <span className="text-sm text-slate-700">{text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button
          className="w-fit h-12 px-8 bg-indigo-600 text-white hover:bg-indigo-700 text-base font-semibold shadow-lg shadow-indigo-300/50 hover:scale-[1.02] transition-transform"
          onClick={() => router.push("/onboarding")}
        >
          Commencer
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>

      {/* ── Right column — decorative ── */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 items-center justify-center p-12 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-white/[0.03]" />

        <WelcomeVisual />
      </div>
    </div>
  );
}
