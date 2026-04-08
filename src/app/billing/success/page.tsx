"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export default function BillingSuccessPage() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalide le cache plan/organisation pour que le dashboard reflète le nouveau plan immédiatement
    queryClient.invalidateQueries({ queryKey: ["organization"] });
    queryClient.invalidateQueries({ queryKey: ["plan-usage"] });
  }, [queryClient]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-10 shadow-sm text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="size-9 text-emerald-500" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900">
          Abonnement activé avec succès !
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-slate-500">
          Votre paiement a été confirmé. Votre nouveau plan est maintenant actif
          et toutes les fonctionnalités associées sont disponibles dans votre
          espace.
        </p>

        <Link href="/dashboard">
          <Button className="w-full bg-indigo-600 font-semibold text-white hover:bg-indigo-700">
            Accéder à mon espace
          </Button>
        </Link>

        <p className="mt-4 text-xs text-slate-400">
          Un reçu a été envoyé à votre adresse email par Stripe.
        </p>
      </div>
    </div>
  );
}
