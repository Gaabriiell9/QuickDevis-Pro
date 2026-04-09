"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Zap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePlan } from "@/hooks/use-plan";

const PLAN_LABELS = { FREE: "Gratuit", PRO: "Pro", BUSINESS: "Business" } as const;
const PLAN_PRICES = { FREE: "0 €", PRO: "15 €", BUSINESS: "32 €" } as const;

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { plan, isLoading } = usePlan();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("success") !== "true") return;
    queryClient.invalidateQueries({ queryKey: ["organization"] });
    queryClient.invalidateQueries({ queryKey: ["plan-usage"] });
    toast.success("Abonnement activé !");
    router.replace("/settings/billing");
  }, [searchParams, queryClient, router]);

  async function handleUpgrade(planKey: string) {
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

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Abonnement</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez votre plan et votre facturation.
        </p>
      </div>

      {/* Plan actuel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan actuel</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <div className="flex items-center gap-3">
              <Badge variant={plan === "FREE" ? "secondary" : "default"} className="text-sm px-3 py-1">
                {PLAN_LABELS[plan]}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {PLAN_PRICES[plan]}/mois
              </span>
              {plan !== "FREE" && (
                <CheckCircle2 className="size-4 text-emerald-500" />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plans disponibles */}
      {plan === "FREE" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-indigo-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="size-4 text-indigo-500" />
                  Pro
                </CardTitle>
                <span className="text-lg font-bold">15 €<span className="text-sm font-normal text-muted-foreground">/mois</span></span>
              </div>
              <CardDescription>Devis et factures illimités</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>✓ Devis illimités</li>
                <li>✓ Factures illimitées</li>
                <li>✓ Clients illimités</li>
                <li>✓ Envoi par email</li>
              </ul>
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => handleUpgrade("pro")}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === "pro" ? (
                  <><Loader2 className="mr-2 size-4 animate-spin" />Redirection…</>
                ) : "Passer au Pro"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="size-4 text-slate-600" />
                  Business
                </CardTitle>
                <span className="text-lg font-bold">32 €<span className="text-sm font-normal text-muted-foreground">/mois</span></span>
              </div>
              <CardDescription>Pour les équipes et entreprises</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>✓ Tout ce qu'inclut Pro</li>
                <li>✓ Gestion d'équipe</li>
                <li>✓ Analytiques avancées</li>
                <li>✓ Support prioritaire</li>
              </ul>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleUpgrade("premium")}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === "premium" ? (
                  <><Loader2 className="mr-2 size-4 animate-spin" />Redirection…</>
                ) : "Passer au Business"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {plan !== "FREE" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Facturation</CardTitle>
            <CardDescription>
              Gérez votre abonnement directement depuis le portail Stripe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Pour annuler ou modifier votre abonnement, contactez notre support ou accédez au portail de facturation Stripe depuis l'email de confirmation reçu lors de votre souscription.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
