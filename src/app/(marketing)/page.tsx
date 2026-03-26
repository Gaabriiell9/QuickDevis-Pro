"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Receipt,
  CreditCard,
  Download,
  Users,
  LayoutDashboard,
  Star,
  Check,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Menu,
  X,
  TrendingUp,
  Bell,
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

const stats = [
  { value: 10000, suffix: "+", label: "utilisateurs actifs" },
  { value: 500000, suffix: "+", label: "documents créés" },
  { value: 99.9, suffix: "%", label: "de disponibilité" },
  { value: 2, suffix: " min", label: "pour créer un devis" },
];

const plans = [
  {
    name: "Gratuit",
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
    price: "29€",
    period: "/mois",
    desc: "Pour les indépendants actifs",
    popular: true,
    features: [
      "Devis illimités",
      "Factures illimitées",
      "Clients illimités",
      "Export PDF & Excel",
      "Relances automatiques",
      "Support prioritaire",
    ],
  },
  {
    name: "Business",
    price: "79€",
    period: "/mois",
    desc: "Pour les équipes et PME",
    popular: false,
    features: [
      "Tout du plan Pro",
      "Multi-utilisateurs",
      "Statistiques avancées",
      "API access",
      "Intégrations comptables",
      "Support dédié",
    ],
  },
];

const testimonials = [
  {
    image: "/images/testimonial-1.jpg",
    name: "Marie Lefebvre",
    role: "Graphiste freelance",
    content:
      "Depuis que j'utilise QuickDevis Pro, je passe moins de temps sur l'administratif et plus sur mes projets. Indispensable !",
    rating: 5,
  },
  {
    image: "/images/testimonial-2.jpg",
    name: "Thomas Dubois",
    role: "Plombier artisan",
    content:
      "Interface simple, devis envoyés en 2 minutes depuis mon téléphone. Mes clients sont impressionnés par le rendu professionnel.",
    rating: 5,
  },
  {
    image: "/images/testimonial-3.jpg",
    name: "Sophie Chartier",
    role: "Consultante RH",
    content:
      "La conformité à la législation française me rassure vraiment. Je n'ai plus à vérifier chaque facture manuellement.",
    rating: 5,
  },
];

// ─── Animated Counter ────────────────────────────────────────────────────────

function AnimatedCounter({
  target,
  suffix,
}: {
  target: number;
  suffix: string;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  const display =
    target % 1 !== 0 ? count.toFixed(1) : count.toLocaleString("fr-FR");

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

// ─── Mock Dashboard ───────────────────────────────────────────────────────────

function MockDashboard() {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-indigo-100/50">
      {/* Topbar */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded bg-indigo-600 text-xs font-bold text-white">
            QD
          </div>
          <span className="text-sm font-semibold text-slate-700">QuickDevis Pro</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 rounded-full bg-slate-200" />
          <div className="size-7 rounded-full bg-indigo-100" />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="flex w-14 flex-col items-center gap-3 border-r border-slate-100 bg-slate-900 py-4">
          {[LayoutDashboard, FileText, Receipt, Users, CreditCard].map(
            (Icon, i) => (
              <div
                key={i}
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg transition-colors",
                  i === 0 ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <Icon className="size-4" />
              </div>
            )
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5">
          {/* KPI row */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { label: "Chiffre d'affaires", value: "24 850 €", trend: "+12%", color: "text-emerald-600" },
              { label: "Devis en attente", value: "8", trend: "3 urgents", color: "text-amber-600" },
              { label: "Factures impayées", value: "3 450 €", trend: "2 factures", color: "text-rose-600" },
            ].map((kpi, i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <p className="mb-1 text-[10px] font-medium text-slate-400">{kpi.label}</p>
                <p className="text-base font-bold text-slate-800">{kpi.value}</p>
                <p className={cn("text-[10px] font-medium", kpi.color)}>{kpi.trend}</p>
              </div>
            ))}
          </div>

          {/* Mini chart bar */}
          <div className="mb-4 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
            <p className="mb-2 text-[10px] font-semibold text-slate-500">Revenus mensuels</p>
            <div className="flex items-end gap-1.5 h-12">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-sm",
                    i === 11 ? "bg-indigo-600" : "bg-indigo-100"
                  )}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Recent docs table */}
          <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-3 py-2">
              <p className="text-[10px] font-semibold text-slate-500">Documents récents</p>
            </div>
            {[
              { ref: "DEV-2024-047", client: "Dupont SAS", amount: "3 200 €", status: "Envoyé", color: "bg-amber-100 text-amber-700" },
              { ref: "FAC-2024-031", client: "Martin & Co", amount: "1 850 €", status: "Payé", color: "bg-emerald-100 text-emerald-700" },
              { ref: "DEV-2024-046", client: "Leclerc Auto", amount: "7 450 €", status: "Brouillon", color: "bg-slate-100 text-slate-600" },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span className="text-[10px] font-mono text-slate-600">{row.ref}</span>
                </div>
                <span className="text-[10px] text-slate-500">{row.client}</span>
                <span className="text-[10px] font-semibold text-slate-700">{row.amount}</span>
                <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-medium", row.color)}>
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

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
                  Gratuit pour démarrer · Aucune carte requise
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
                Devis · factures · clients et paiements — centralisés et conformes.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="mb-10 flex flex-col gap-3 sm:flex-row"
              >
                <Link href="/register">
                  <Button className="h-12 bg-indigo-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-300/60 transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-400/50 hover:scale-[1.02]">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
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
                className="flex flex-wrap gap-3"
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

            {/* Right — freelancer photo */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden shadow-2xl shadow-indigo-200/50">
                <Image
                  src="/images/hero-freelancer.jpg"
                  alt="Indépendante utilisant QuickDevis Pro"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              {/* Floating rating chip */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs font-semibold text-slate-800">4,9 · +10 000 utilisateurs</p>
              </div>
              {/* Floating doc chip */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3">
                <p className="text-xs text-slate-500 mb-0.5">Devis créé</p>
                <p className="text-sm font-bold text-indigo-600">DEV-2025-047</p>
                <p className="text-xs text-slate-400">3 200 € · envoyé</p>
              </div>
            </motion.div>
          </div>

          {/* ── Dashboard mockup (full width) ── */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mx-auto max-w-5xl"
          >
            <MockDashboard />
          </motion.div>
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

      {/* ── STATS ── */}
      <section className="bg-indigo-950 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="mb-1 text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm font-medium text-indigo-300">{stat.label}</p>
              </motion.div>
            ))}
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
                  <Link href="/register">
                    <Button
                      className={cn(
                        "w-full font-semibold",
                        plan.popular
                          ? "bg-indigo-600 text-white hover:bg-indigo-700"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      Commencer
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <span className="mb-3 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              Témoignages
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Ils nous font confiance
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(99,102,241,0.08)" }}
                className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
              >
                <StarRating count={t.rating} />
                <p className="my-4 flex-1 text-sm leading-relaxed text-slate-600">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative size-10 shrink-0 rounded-full overflow-hidden border border-slate-100">
                    <Image
                      src={t.image}
                      alt={t.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
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
              Rejoignez des milliers de professionnels qui gagnent du temps chaque jour.
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
