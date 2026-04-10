"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  FileText,
  Receipt,
  CreditCard,
  Download,
  Users,
  LayoutDashboard,
  Package,
  Check,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Menu,
  X,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Data ───────────────────────────────────────────────────────────────────

const features = [
  {
    icon: FileText,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    title: "Devis professionnels",
    desc: "Créez des devis soignés en moins de 2 minutes avec vos informations pré-remplies.",
  },
  {
    icon: Receipt,
    color: "text-violet-600",
    bg: "bg-violet-50",
    title: "Facturation automatique",
    desc: "Transformez vos devis en factures en un clic. Numérotation automatique et conforme.",
  },
  {
    icon: CreditCard,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "Suivi des paiements",
    desc: "Visualisez en temps réel les factures payées, en attente ou en retard.",
  },
  {
    icon: Download,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Export PDF",
    desc: "Téléchargez vos documents en PDF haute qualité, prêts à envoyer à vos clients.",
  },
  {
    icon: Users,
    color: "text-rose-600",
    bg: "bg-rose-50",
    title: "Gestion clients",
    desc: "Centralisez vos clients, historiques et informations dans un annuaire intelligent.",
  },
  {
    icon: LayoutDashboard,
    color: "text-sky-600",
    bg: "bg-sky-50",
    title: "Tableau de bord",
    desc: "Pilotez votre activité avec des indicateurs clés clairs et des graphiques interactifs.",
  },
];

const plans = [
  {
    name: "Gratuit",
    planKey: null as string | null,
    price: "0€",
    period: "",
    desc: "Parfait pour démarrer",
    popular: false,
    features: [
      "5 devis / mois",
      "5 factures / mois",
      "2 clients",
      "Export PDF",
      "Support email",
    ],
  },
  {
    name: "Pro",
    planKey: "pro" as string | null,
    price: "15€",
    period: "/mois",
    desc: "Pour les indépendants actifs",
    popular: true,
    features: [
      "Devis illimités",
      "Factures illimitées",
      "Clients illimités",
      "Export PDF professionnel",
      "Relances automatiques (bientôt)",
      "Support prioritaire",
    ],
  },
  {
    name: "Premium",
    planKey: "premium" as string | null,
    price: "32€",
    period: "/mois",
    desc: "Pour les équipes et PME",
    popular: false,
    features: [
      "Tout du plan Pro",
      "Multi-utilisateurs",
      "Statistiques avancées",
      "Export comptable (FEC)",
      "Support dédié",
    ],
  },
];

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { status } = useSession();
  const router = useRouter();

  async function handleCommencer(planKey: string | null) {
    if (!planKey) {
      router.push("/register");
      return;
    }
    if (status !== "authenticated") {
      router.push(`/register?plan=${planKey}`);
      return;
    }
    setLoadingPlan(planKey);
    try {
      const res = await fetch("/api/v1/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, returnUrl: window.location.href }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? "Impossible de lancer le paiement. Réessayez.");
      }
    } catch {
      toast.error("Erreur serveur. Réessayez.");
    } finally {
      setLoadingPlan(null);
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.15 } },
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* ── NAVBAR ── */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-extrabold text-white shadow-md">
              QD
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              QuickDevis <span className="text-indigo-600">Pro</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Fonctionnalités
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Tarifs
            </a>
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Se connecter
            </Link>
          </div>

          {/* CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/register">
              <Button className="h-9 bg-indigo-600 px-5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700">
                Essayer gratuitement
                <ArrowRight className="ml-1 size-3.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-slate-100 bg-white/95 px-6 pb-5 md:hidden"
            >
              <div className="flex flex-col gap-4 pt-4">
                <a href="#features" className="text-sm font-medium text-slate-700" onClick={() => setMobileOpen(false)}>Fonctionnalités</a>
                <a href="#pricing" className="text-sm font-medium text-slate-700" onClick={() => setMobileOpen(false)}>Tarifs</a>
                <Link href="/login" className="text-sm font-medium text-slate-700" onClick={() => setMobileOpen(false)}>Se connecter</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
                    Essayer gratuitement
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pb-24 pt-32">
        {/* Background décor */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="hero-grid-bg absolute inset-0" />
          <div className="hero-blob-1 absolute -top-40 left-1/2 h-[700px] w-[700px] rounded-full bg-indigo-600 opacity-[0.06] blur-3xl" />
          <div className="hero-blob-2 absolute -right-40 top-0 h-[520px] w-[520px] rounded-full bg-violet-600 opacity-[0.04] blur-3xl" />
          <div className="hero-blob-3 absolute -left-32 bottom-8 h-96 w-96 rounded-full bg-sky-500 opacity-[0.04] blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6">
          {/* ── 2-col : texte gauche / photo droite ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
            {/* Left — text */}
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
            >
              {/* Pill badge */}
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700">
                  <Zap className="size-3" />
                  Gratuit pour démarrer, aucune carte requise
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
              >
                Gérez vos devis et factures
              </motion.h1>
              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-indigo-600 sm:text-5xl lg:text-6xl"
              >
                en quelques clics.
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="mb-10 max-w-lg text-lg leading-relaxed text-slate-500"
              >
                La solution tout-en-un pour les indépendants et PME françaises.
                Devis, factures, clients et paiements, centralisés et conformes.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="mb-10 flex flex-col gap-3 sm:flex-row"
              >
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="h-12 border-slate-200 px-8 text-base font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  >
                    Se connecter
                  </Button>
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="flex flex-wrap items-center gap-4"
              >
                {[
                  { Icon: Shield, label: "Données sécurisées" },
                  { Icon: Globe, label: "Conforme législation française" },
                  { Icon: Zap, label: "Gratuit pour démarrer" },
                ].map(({ Icon, label }) => (
                  <span
                    key={label}
                    className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-600"
                  >
                    <Icon className="size-3.5 text-slate-400" />
                    {label}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — App Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              {/* Fond décoratif */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-50" />
              <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-200/40 blur-3xl" />
              <div className="absolute -right-6 top-8 h-48 w-48 rounded-full bg-violet-200/30 blur-2xl" />

              {/* Conteneur mockup */}
              <div className="relative rounded-2xl bg-slate-900 shadow-2xl shadow-indigo-300/30 ring-1 ring-white/10">
                {/* Barre de titre macOS */}
                <div className="flex items-center gap-1.5 px-3 py-2.5">
                  <div className="size-2.5 rounded-full bg-rose-500" />
                  <div className="size-2.5 rounded-full bg-amber-400" />
                  <div className="size-2.5 rounded-full bg-emerald-500" />
                  <div className="mx-auto h-1.5 w-28 rounded-full bg-slate-700" />
                </div>

                {/* Écran */}
                <div className="flex overflow-hidden rounded-b-2xl" style={{ height: 320 }}>
                  {/* Sidebar */}
                  <div className="flex w-12 shrink-0 flex-col items-center gap-3 bg-indigo-700 py-4">
                    <div className="mb-2 flex size-7 items-center justify-center rounded-lg bg-white/20 text-[9px] font-extrabold text-white">
                      QD
                    </div>
                    {[LayoutDashboard, FileText, Users, Package].map((Icon, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex size-7 items-center justify-center rounded-lg transition-colors",
                          i === 0 ? "bg-white/20" : "opacity-40 hover:opacity-70"
                        )}
                      >
                        <Icon className="size-3.5 text-white" />
                      </div>
                    ))}
                  </div>

                  {/* Zone principale */}
                  <div className="flex-1 overflow-hidden bg-slate-50 p-3">
                    {/* Header */}
                    <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <p className="text-[11px] font-bold text-slate-800">Tableau de bord</p>
                        <p className="text-[9px] text-slate-400">Avril 2025</p>
                      </div>
                      <div className="flex size-6 items-center justify-center rounded-full bg-indigo-100">
                        <span className="text-[8px] font-bold text-indigo-700">JD</span>
                      </div>
                    </div>

                    {/* KPI cards */}
                    <div className="mb-3 grid grid-cols-3 gap-1.5">
                      {[
                        { label: "Chiffre d'affaires", value: "24 850 €", badge: "+12%", bc: "bg-emerald-100 text-emerald-700" },
                        { label: "Devis en attente", value: "8", badge: "3 urgents", bc: "bg-amber-100 text-amber-700" },
                        { label: "Factures impayées", value: "3 450 €", badge: "2 factures", bc: "bg-rose-100 text-rose-700" },
                      ].map((kpi, i) => (
                        <div key={i} className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
                          <p className="mb-0.5 text-[7px] leading-tight text-slate-400">{kpi.label}</p>
                          <p className="text-[11px] font-bold text-slate-800">{kpi.value}</p>
                          <span className={cn("mt-0.5 inline-block rounded px-1 py-px text-[7px] font-semibold", kpi.bc)}>
                            {kpi.badge}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Devis récents */}
                    <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
                      <div className="border-b border-slate-100 px-2.5 py-1.5">
                        <p className="text-[9px] font-semibold text-slate-600">Devis récents</p>
                      </div>
                      {[
                        { ref: "DEV-2025-047", client: "Martin SARL", amount: "3 200 €", status: "Envoyé", sc: "bg-blue-100 text-blue-700" },
                        { ref: "DEV-2025-046", client: "Dupont & Co", amount: "1 850 €", status: "Accepté", sc: "bg-emerald-100 text-emerald-700" },
                        { ref: "DEV-2025-045", client: "Leblanc SAS", amount: "920 €", status: "Brouillon", sc: "bg-slate-100 text-slate-500" },
                      ].map((row, i) => (
                        <div key={i} className="flex items-center gap-2 border-b border-slate-50 px-2.5 py-1.5 last:border-0">
                          <span className="w-[68px] shrink-0 font-mono text-[7px] text-slate-500">{row.ref}</span>
                          <span className="min-w-0 flex-1 truncate text-[7px] text-slate-500">{row.client}</span>
                          <span className="shrink-0 text-[7px] font-semibold text-slate-700">{row.amount}</span>
                          <span className={cn("shrink-0 rounded px-1.5 py-px text-[7px] font-medium", row.sc)}>{row.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Badge flottant — "Devis créé" */}
              <div className="absolute -right-4 -top-4 rounded-xl border border-slate-100 bg-white p-3 shadow-xl">
                <div className="mb-1 flex items-center gap-1.5">
                  <div className="flex size-4 items-center justify-center rounded-full bg-emerald-100">
                    <Check className="size-2.5 text-emerald-600" />
                  </div>
                  <p className="text-[10px] font-medium text-slate-500">Devis créé</p>
                </div>
                <p className="text-xs font-bold text-indigo-600">DEV-2025-047</p>
                <p className="text-[10px] text-slate-400">3 200 € envoyé</p>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <span className="mb-3 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              Fonctionnalités
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mt-3 text-slate-500">
              Une suite complète pensée pour les professionnels français.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(99,102,241,0.13)" }}
                  className="group cursor-default rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-indigo-100"
                >
                  <div
                    className={cn(
                      "mb-4 flex size-11 items-center justify-center rounded-xl",
                      feature.bg
                    )}
                  >
                    <Icon className={cn("size-5", feature.color)} />
                  </div>
                  <h3 className="mb-2 font-bold text-slate-900">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <span className="mb-3 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              Tarifs
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Simple et transparent
            </h2>
            <p className="mt-3 text-slate-500">
              Commencez gratuitement, évoluez selon vos besoins.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-8 shadow-sm transition-shadow",
                  plan.popular
                    ? "border-indigo-500 bg-white shadow-indigo-100/80 ring-2 ring-indigo-500"
                    : "border-slate-100 bg-white"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold text-white shadow">
                      Populaire
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="mb-1 text-lg font-bold text-slate-900">{plan.name}</h3>
                  <p className="mb-4 text-sm text-slate-500">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-sm font-medium text-slate-400">{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="mb-8 flex flex-col gap-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                        <Check className="size-3 text-indigo-600" />
                      </div>
                      <span className="text-sm text-slate-600">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <Button
                    onClick={() => handleCommencer(plan.planKey)}
                    disabled={loadingPlan === plan.planKey}
                    className={cn(
                      "w-full font-semibold",
                      plan.popular
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {loadingPlan === plan.planKey ? "Redirection…" : "Commencer"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-indigo-600 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-white">
              Prêt à simplifier votre facturation ?
            </h2>
            <p className="mb-8 text-indigo-200">
              Une solution simple pour gérer vos devis et factures, conforme à la législation française.
            </p>
            <Link href="/register">
              <Button className="h-12 bg-white px-8 text-base font-bold text-indigo-600 shadow-lg hover:bg-indigo-50">
                Commencer gratuitement
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-extrabold text-white">
                QD
              </div>
              <span className="text-sm font-bold text-slate-900">
                QuickDevis <span className="text-indigo-600">Pro</span>
              </span>
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <Link href="/login" className="hover:text-slate-700">
                Connexion
              </Link>
              <Link href="/register" className="hover:text-slate-700">
                Inscription
              </Link>
              <Link href="/mentions-legales" className="hover:text-slate-700">
                Mentions légales
              </Link>
              <Link href="/cgu" className="hover:text-slate-700">
                CGU
              </Link>
              <Link href="/confidentialite" className="hover:text-slate-700">
                Confidentialité
              </Link>
            </div>

            <p className="flex items-center gap-1 text-xs text-slate-400">
              © {new Date().getFullYear()} QuickDevis Pro. Fait avec
              <Heart className="size-3 fill-rose-400 text-rose-400" />
              en France.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
