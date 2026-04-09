"use client";

import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePlan, type Plan } from "@/hooks/use-plan";
import { Button } from "@/components/ui/button";

const PLAN_LABELS: Record<Plan, string> = {
  FREE: "Gratuit",
  PRO: "Pro",
  BUSINESS: "Business",
};

const PLAN_KEY: Record<Plan, string | null> = {
  FREE: null,
  PRO: "pro",
  BUSINESS: "premium",
};

interface PlanGateProps {
  plan: Plan;
  feature: string;
  children: React.ReactNode;
  className?: string;
}

export function PlanGate({ plan, feature, children, className }: PlanGateProps) {
  const { hasAccess } = usePlan();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (hasAccess(plan)) {
    return <>{children}</>;
  }

  async function handleUpgrade() {
    const planKey = PLAN_KEY[plan];
    if (!planKey) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, returnUrl: window.location.href }),
      });
      if (res.status === 401) {
        router.push(`/register?plan=${planKey}`);
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? "Impossible de lancer le paiement. Réessayez.");
      }
    } catch {
      toast.error("Erreur serveur. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <div className="pointer-events-none select-none opacity-25 blur-sm" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px]">
        <div className="flex flex-col items-center gap-3 p-8 text-center max-w-xs">
          <div className="flex size-12 items-center justify-center rounded-full bg-indigo-50">
            <Lock className="size-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-800">
              Disponible avec le plan {PLAN_LABELS[plan]}
            </p>
            <p className="mt-1 text-sm text-slate-500">{feature}</p>
          </div>
          <Button
            className="mt-1 bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="mr-2 size-4 animate-spin" />Redirection…</>
            ) : (
              `Passer au ${PLAN_LABELS[plan]}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
