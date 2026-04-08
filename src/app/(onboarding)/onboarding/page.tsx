"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  FileText,
  Receipt,
  Users,
  CreditCard,
  Briefcase,
  Building,
  Building2,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ─── Schema & types ────────────────────────────────────────────────────────

const onboardingSchema = z.object({
  name: z.string().min(2, "Nom requis (min. 2 caractères)"),
  email: z.string().optional(),
  phone: z.string().optional(),
  siret: z.string().optional(),
  vatNumber: z.string().optional(),
  currency: z.string(),
  locale: z.string(),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

type StartFocus = "quotes" | "invoices" | "clients" | "payments" | null;
type LegalForm = "AE" | "SARL" | "SAS" | "SASU" | "EI" | null;

// ─── Step visuals ──────────────────────────────────────────────────────────

function VisualStep1({ selected }: { selected: StartFocus }) {
  const items = [
    { key: "quotes", icon: FileText, label: "Devis", color: "bg-indigo-100 text-indigo-600" },
    { key: "invoices", icon: Receipt, label: "Factures", color: "bg-violet-100 text-violet-600" },
    { key: "clients", icon: Users, label: "Clients", color: "bg-emerald-100 text-emerald-600" },
    { key: "payments", icon: CreditCard, label: "Paiements", color: "bg-amber-100 text-amber-600" },
  ] as const;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <p className="text-indigo-200 text-sm font-medium mb-2">Votre futur tableau de bord</p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {items.map(({ key, icon: Icon, label, color }) => (
          <div
            key={key}
            className={cn(
              "bg-white/10 rounded-2xl p-5 flex flex-col items-center gap-2 transition-all duration-200",
              selected === key && "bg-white/25 scale-105 ring-2 ring-white/40"
            )}
          >
            <div className={cn("size-10 rounded-xl flex items-center justify-center", color)}>
              <Icon className="size-5" />
            </div>
            <span className="text-sm font-semibold text-white">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualStep2({ legalForm, name }: { legalForm: LegalForm; name: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 gap-6">
      <p className="text-indigo-200 text-sm font-medium">Aperçu de votre en-tête</p>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs">
        <div className="flex items-center gap-3 mb-5">
          <div className="size-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-extrabold shrink-0">
            {name ? name.slice(0, 2).toUpperCase() : "QD"}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 truncate">{name || "Mon Entreprise"}</p>
            {legalForm && (
              <p className="text-xs text-slate-400">{legalForm}</p>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          {[
            { w: "75%" },
            { w: "55%" },
            { w: "65%" },
          ].map((line, i) => (
            <div key={i} className="h-2 rounded-full bg-slate-200" style={{ width: line.w }} />
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Prestation</span>
            <span>250 €</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Consultation</span>
            <span>150 €</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-slate-800 mt-3 pt-2 border-t border-slate-100">
            <span>Total TTC</span>
            <span>480 €</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisualStep3({ currency }: { currency: string }) {
  const currencySymbol: Record<string, string> = {
    EUR: "€", USD: "$", GBP: "£", CHF: "Fr", CAD: "C$",
  };
  const symbol = currencySymbol[currency] ?? "€";

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 gap-6">
      <p className="text-indigo-200 text-sm font-medium">Vos documents avec vos préférences</p>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Devis</span>
          <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full">
            DEV-2025-001
          </span>
        </div>
        {[
          { label: "Développement", qty: 1, price: 1200 },
          { label: "Maintenance", qty: 3, price: 150 },
        ].map((line) => (
          <div key={line.label} className="flex justify-between items-center text-sm">
            <div>
              <p className="font-medium text-slate-700">{line.label}</p>
              <p className="text-xs text-slate-400">× {line.qty}</p>
            </div>
            <p className="font-semibold text-slate-800">
              {(line.qty * line.price).toLocaleString("fr-FR")} {symbol}
            </p>
          </div>
        ))}
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <span className="text-sm text-slate-400">Total TTC</span>
          <span className="text-lg font-extrabold text-slate-900">1 650 {symbol}</span>
        </div>
      </div>
    </div>
  );
}

function VisualStep4({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 gap-6">
      <div className="flex flex-col items-center gap-4">
        <div className="size-20 rounded-full bg-white/20 flex items-center justify-center">
          <div className="size-14 rounded-full bg-white/30 flex items-center justify-center">
            <Check className="size-8 text-white" strokeWidth={3} />
          </div>
        </div>
        <p className="text-white text-xl font-bold text-center">Tout est prêt !</p>
        <p className="text-indigo-200 text-sm text-center max-w-48">
          {name || "Votre entreprise"} est configurée et prête à facturer.
        </p>
      </div>

      <div className="bg-white/10 rounded-2xl p-5 w-full max-w-xs space-y-3">
        {[
          "Créer votre premier devis",
          "Ajouter vos clients",
          "Envoyer une facture",
        ].map((action, i) => (
          <div key={action} className="flex items-center gap-3">
            <div className="size-6 rounded-full bg-indigo-400/40 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {i + 1}
            </div>
            <span className="text-sm text-indigo-100">{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Legal form card ────────────────────────────────────────────────────────

const LEGAL_FORMS: { key: LegalForm; label: string; desc: string; icon: typeof Briefcase }[] = [
  { key: "AE",   label: "Auto-entrepreneur", desc: "Micro-entreprise",    icon: Store     },
  { key: "SARL", label: "SARL",             desc: "Société à resp. lim.", icon: Building  },
  { key: "SAS",  label: "SAS",              desc: "Société par actions",  icon: Building2 },
  { key: "SASU", label: "SASU",             desc: "SAS unipersonnelle",   icon: Briefcase },
];

// ─── Progress bar ───────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            i + 1 === step
              ? "w-8 bg-indigo-600"
              : i + 1 < step
              ? "w-4 bg-indigo-300"
              : "w-4 bg-slate-200"
          )}
        />
      ))}
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [startFocus, setStartFocus] = useState<StartFocus>(null);
  const [legalForm, setLegalForm] = useState<LegalForm>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    control,
  } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { currency: "EUR", locale: "fr-FR" },
  });

  const watchName = watch("name") ?? "";
  const watchCurrency = watch("currency") ?? "EUR";

  const stepFieldsToValidate: Record<number, (keyof OnboardingForm)[]> = {
    1: [],
    2: ["name"],
    3: [],
    4: [],
  };

  const nextStep = async () => {
    const valid = await trigger(stepFieldsToValidate[step]);
    if (valid) setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const onSubmit = async (data: OnboardingForm) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        toast.error(body.error ?? "Erreur lors de la création");
        return;
      }

      const org = await res.json();
      await update({ organizationId: org.id, onboardingCompleted: true });

      const pendingPlan = sessionStorage.getItem("pendingPlan");
      if (pendingPlan) {
        sessionStorage.removeItem("pendingPlan");
        try {
          const checkoutRes = await fetch("/api/v1/billing/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ plan: pendingPlan }),
          });
          const checkoutData = await checkoutRes.json();
          if (checkoutData.url) {
            window.location.href = checkoutData.url;
            return;
          }
        } catch {
          // En cas d'erreur, on redirige vers le dashboard normalement
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const startFocusItems = [
    { key: "quotes" as StartFocus,   icon: FileText,  label: "Devis",      desc: "Créez et envoyez des devis"    },
    { key: "invoices" as StartFocus, icon: Receipt,   label: "Factures",   desc: "Facturez vos clients"          },
    { key: "clients" as StartFocus,  icon: Users,     label: "Clients",    desc: "Gérez votre portefeuille"      },
    { key: "payments" as StartFocus, icon: CreditCard,label: "Paiements",  desc: "Suivez vos encaissements"      },
  ];

  return (
    <div className="flex bg-white">
      {/* ── Left — form ── */}
      <div className="w-full md:w-1/2 flex flex-col px-6 sm:px-10 md:px-12 lg:px-16 py-10 min-h-screen">
        {/* Logo + progress */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-extrabold shadow">
              QD
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-sm">QuickDevis Pro</span>
          </div>
          <ProgressBar step={step} total={TOTAL_STEPS} />
        </div>

        {/* Step label */}
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">
          Étape {step} sur {TOTAL_STEPS}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1">
          {/* ── Step 1 ── */}
          {step === 1 && (
            <div key="step-1" className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                  Par quoi voulez-vous commencer ?
                </h2>
                <p className="text-slate-500">Sélectionnez votre priorité — vous aurez accès à tout par la suite.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {startFocusItems.map(({ key, icon: Icon, label, desc }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStartFocus(key)}
                    className={cn(
                      "relative flex flex-col items-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-150 hover:border-indigo-300 hover:bg-indigo-50/50",
                      startFocus === key
                        ? "border-indigo-600 bg-indigo-50 shadow-sm"
                        : "border-slate-200 bg-white"
                    )}
                  >
                    <div className={cn(
                      "size-10 rounded-xl flex items-center justify-center",
                      startFocus === key ? "bg-indigo-100" : "bg-slate-100"
                    )}>
                      <Icon className={cn("size-5", startFocus === key ? "text-indigo-600" : "text-slate-500")} />
                    </div>
                    <div>
                      <p className={cn("font-semibold text-sm", startFocus === key ? "text-indigo-700" : "text-slate-800")}>
                        {label}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    </div>
                    {startFocus === key && (
                      <div className="absolute top-3 right-3 size-5 rounded-full bg-indigo-600 flex items-center justify-center">
                        <Check className="size-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div key="step-2" className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                  Votre entreprise
                </h2>
                <p className="text-slate-500">Ces informations apparaîtront sur vos documents.</p>
              </div>

              {/* Legal form cards */}
              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-2 block">Forme juridique</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LEGAL_FORMS.map(({ key, label, desc, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setLegalForm(key)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all duration-150 hover:border-indigo-300",
                        legalForm === key
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-slate-200 bg-white"
                      )}
                    >
                      <Icon className={cn("size-5", legalForm === key ? "text-indigo-600" : "text-slate-400")} />
                      <p className={cn("text-xs font-bold", legalForm === key ? "text-indigo-700" : "text-slate-700")}>
                        {label}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-tight">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                    Nom de la société <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder={legalForm === "AE" ? "Jean Dupont" : "Ma Société SAS"}
                    className="h-11"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email pro</Label>
                    <Input id="email" type="email" placeholder="contact@exemple.fr" className="h-11" {...register("email")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Téléphone</Label>
                    <Input id="phone" placeholder="01 23 45 67 89" className="h-11" {...register("phone")} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <div key="step-3" className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                  Personnalisation
                </h2>
                <p className="text-slate-500">Ces paramètres s&apos;appliquent à tous vos documents.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Devise</Label>
                  <Controller
                    name="currency"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value ?? "EUR"} onValueChange={field.onChange}>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
                          <SelectItem value="USD">USD — Dollar ($)</SelectItem>
                          <SelectItem value="GBP">GBP — Livre sterling (£)</SelectItem>
                          <SelectItem value="CHF">CHF — Franc suisse (Fr)</SelectItem>
                          <SelectItem value="CAD">CAD — Dollar canadien (C$)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Langue des documents</Label>
                  <Controller
                    name="locale"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value ?? "fr-FR"} onValueChange={field.onChange}>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr-FR">Français (France)</SelectItem>
                          <SelectItem value="fr-BE">Français (Belgique)</SelectItem>
                          <SelectItem value="fr-CH">Français (Suisse)</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="en-GB">English (UK)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="siret" className="text-sm font-semibold text-slate-700">
                      SIRET <span className="text-slate-400 font-normal">(optionnel)</span>
                    </Label>
                    <Input id="siret" placeholder="123 456 789 00012" className="h-11" {...register("siret")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="vatNumber" className="text-sm font-semibold text-slate-700">
                      N° TVA <span className="text-slate-400 font-normal">(optionnel)</span>
                    </Label>
                    <Input id="vatNumber" placeholder="FR12345678901" className="h-11" {...register("vatNumber")} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4 ── */}
          {step === 4 && (
            <div key="step-4" className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                  Tout est prêt !
                </h2>
                <p className="text-slate-500">Vérifiez vos informations avant de terminer.</p>
              </div>

              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                {[
                  { label: "Entreprise", value: watchName || "—" },
                  { label: "Forme juridique", value: legalForm ?? "Non précisé" },
                  { label: "Devise", value: watchCurrency },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className="text-sm font-semibold text-slate-800">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-3 bg-indigo-50 rounded-xl p-4">
                <div className="size-5 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="size-3 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-800">Essai Pro 14 jours activé</p>
                  <p className="text-xs text-indigo-600 mt-0.5">
                    Accès à toutes les fonctionnalités Pro. Aucune carte requise.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="mt-auto pt-8">
            <div className="flex gap-3">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-5 gap-2"
                  onClick={() => setStep((s) => s - 1)}
                >
                  <ArrowLeft className="size-4" />
                  Retour
                </Button>
              )}

              {step < TOTAL_STEPS ? (
                <Button
                  type="button"
                  className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 font-semibold gap-2"
                  onClick={nextStep}
                >
                  Continuer
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 font-semibold gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Accéder à mon tableau de bord
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Skip step 3 */}
            {step === 3 && (
              <button
                type="button"
                onClick={nextStep}
                className="mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Passer cette étape →
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Right — contextual visual ── */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 sticky top-0 h-screen overflow-hidden relative">
        {/* Background orbs */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-white/5" />

        <div className="flex-1 flex">
          {step === 1 && <VisualStep1 selected={startFocus} />}
          {step === 2 && <VisualStep2 legalForm={legalForm} name={watchName} />}
          {step === 3 && <VisualStep3 currency={watchCurrency} />}
          {step === 4 && <VisualStep4 name={watchName} />}
        </div>
      </div>
    </div>
  );
}
