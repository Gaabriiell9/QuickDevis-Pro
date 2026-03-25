import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// ─── Document mockups (right-side visuals) ────────────────────────────────

function QuoteMockup() {
  return (
    <div className="w-full max-w-[260px] bg-white rounded-2xl shadow-xl border border-slate-100 p-5 mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Devis</p>
          <p className="text-sm font-bold text-slate-800">DEV-2025-001</p>
        </div>
        <span className="bg-amber-100 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
          Envoyé
        </span>
      </div>
      <div className="space-y-2 mb-4">
        {[
          { label: "Développement web", price: "1 800 €" },
          { label: "Design UI/UX", price: "600 €" },
          { label: "Maintenance", price: "150 €" },
        ].map((line) => (
          <div key={line.label} className="flex justify-between items-center">
            <span className="text-xs text-slate-500">{line.label}</span>
            <span className="text-xs font-semibold text-slate-700">{line.price}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
        <span className="text-xs text-slate-400">Total TTC</span>
        <span className="text-base font-extrabold text-slate-900">3 060 €</span>
      </div>
      <div className="mt-3 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
        <span className="text-[10px] font-bold text-white uppercase tracking-wide">Envoyer au client</span>
      </div>
    </div>
  );
}

function InvoiceMockup() {
  return (
    <div className="w-full max-w-[260px] bg-white rounded-2xl shadow-xl border border-slate-100 p-5 mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">Facture</p>
          <p className="text-sm font-bold text-slate-800">FAC-2025-001</p>
        </div>
        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
          Payée ✓
        </span>
      </div>
      <div className="space-y-2 mb-4">
        {[
          { label: "Prestation de service", price: "2 400 €" },
          { label: "Frais de déplacement", price: "120 €" },
        ].map((line) => (
          <div key={line.label} className="flex justify-between items-center">
            <span className="text-xs text-slate-500">{line.label}</span>
            <span className="text-xs font-semibold text-slate-700">{line.price}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 pt-3 space-y-1">
        <div className="flex justify-between">
          <span className="text-xs text-slate-400">Payé</span>
          <span className="text-xs font-semibold text-emerald-600">2 904 €</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-400">Reste dû</span>
          <span className="text-xs font-bold text-slate-900">0 €</span>
        </div>
      </div>
    </div>
  );
}

function ClientMockup() {
  const clients = [
    { initials: "DS", color: "bg-indigo-600", name: "Dupont SAS", tag: "Société", last: "Il y a 2j" },
    { initials: "ML", color: "bg-violet-600", name: "Marie Lefebvre", tag: "Particulier", last: "Il y a 5j" },
    { initials: "AG", color: "bg-emerald-600", name: "Agence Nova", tag: "Société", last: "Il y a 1 sem" },
  ];

  return (
    <div className="w-full max-w-[280px] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mx-auto">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
        <p className="text-xs font-semibold text-slate-500">3 clients actifs</p>
      </div>
      {clients.map((c) => (
        <div key={c.name} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
          <div className={`size-8 rounded-full ${c.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
            {c.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
            <p className="text-[10px] text-slate-400">{c.tag}</p>
          </div>
          <p className="text-[10px] text-slate-400 shrink-0">{c.last}</p>
        </div>
      ))}
    </div>
  );
}

function ProductMockup() {
  const products = [
    { name: "Développement web", unit: "h", price: "80 €" },
    { name: "Conseil & stratégie", unit: "j", price: "600 €" },
    { name: "Formation", unit: "session", price: "450 €" },
  ];

  return (
    <div className="w-full max-w-[280px] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mx-auto">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
        <p className="text-xs font-semibold text-slate-500">Catalogue produits</p>
      </div>
      {products.map((p) => (
        <div key={p.name} className="flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0">
          <div>
            <p className="text-sm font-semibold text-slate-800">{p.name}</p>
            <p className="text-[10px] text-slate-400">par {p.unit}</p>
          </div>
          <span className="text-sm font-bold text-indigo-600">{p.price}</span>
        </div>
      ))}
      <div className="px-4 py-2.5">
        <div className="h-7 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-slate-400">+ Ajouter un produit</span>
        </div>
      </div>
    </div>
  );
}

// ─── Configs ──────────────────────────────────────────────────────────────

type Variant = "quotes" | "invoices" | "clients" | "products";

const CONFIGS: Record<
  Variant,
  {
    badge: string;
    title: string;
    description: string;
    benefits: string[];
    cta: string;
    href: string;
    visual: React.ReactNode;
  }
> = {
  quotes: {
    badge: "Devis",
    title: "Créez vos premiers devis et faites-les signer",
    description: "Générez des devis professionnels en moins de 2 minutes, envoyez-les par email et suivez les réponses en temps réel.",
    benefits: [
      "Numérotation automatique conforme",
      "Conversion en facture en 1 clic",
      "Relances automatiques",
    ],
    cta: "Créer un devis",
    href: "/quotes/new",
    visual: <QuoteMockup />,
  },
  invoices: {
    badge: "Factures",
    title: "Facturez vos clients et encaissez plus vite",
    description: "Créez des factures conformes à la législation française, suivez les paiements et gérez vos impayés sans effort.",
    benefits: [
      "Conformité TVA et mentions légales",
      "Suivi des paiements en temps réel",
      "Export PDF haute qualité",
    ],
    cta: "Créer une facture",
    href: "/invoices/new",
    visual: <InvoiceMockup />,
  },
  clients: {
    badge: "Clients",
    title: "Centralisez vos clients et leur historique",
    description: "Un annuaire intelligent pour retrouver instantanément chaque client, ses devis, ses factures et ses paiements.",
    benefits: [
      "Fiches clients complètes",
      "Historique complet des documents",
      "Import depuis un fichier CSV",
    ],
    cta: "Ajouter un client",
    href: "/clients/new",
    visual: <ClientMockup />,
  },
  products: {
    badge: "Produits & Services",
    title: "Constituez votre catalogue pour facturer en 30 secondes",
    description: "Enregistrez vos prestations, tarifs et taux de TVA une seule fois, et insérez-les dans n'importe quel document.",
    benefits: [
      "Taux de TVA par produit",
      "Insertion rapide dans les documents",
      "Gestion des unités et quantités",
    ],
    cta: "Ajouter un produit",
    href: "/products/new",
    visual: <ProductMockup />,
  },
};

// ─── Component ────────────────────────────────────────────────────────────

interface RichEmptyStateProps {
  variant: Variant;
}

export function RichEmptyState({ variant }: RichEmptyStateProps) {
  const config = CONFIGS[variant];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left — text */}
        <div className="flex-1 flex flex-col justify-center px-8 py-12 md:py-16">
          {/* Badge */}
          <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 mb-5">
            {config.badge}
          </span>

          {/* Title */}
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-3 max-w-sm">
            {config.title}
          </h3>

          {/* Description */}
          <p className="text-slate-500 leading-relaxed mb-6 max-w-sm">
            {config.description}
          </p>

          {/* Benefits */}
          <ul className="space-y-2.5 mb-8">
            {config.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5">
                <div className="size-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="size-3 text-emerald-600" />
                </div>
                <span className="text-sm text-slate-700">{benefit}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Button asChild className="w-fit bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 font-semibold gap-2">
            <Link href={config.href}>
              {config.cta}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* Right — visual */}
        <div className="hidden md:flex flex-col flex-1 max-w-[360px] items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/30 px-8 py-12 border-l border-slate-100">
          {config.visual}
        </div>
      </div>
    </div>
  );
}
