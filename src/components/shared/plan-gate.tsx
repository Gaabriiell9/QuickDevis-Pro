"use client";

import { useState } from "react";
import { Lock, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePlan, type Plan } from "@/hooks/use-plan";

const PLAN_LABELS: Record<Plan, string> = {
  FREE: "Gratuit",
  PRO: "Pro",
  BUSINESS: "Business",
};

interface PlanGateProps {
  plan: Plan;
  feature: string;
  children: React.ReactNode;
  className?: string;
}

export function PlanGate({ plan, feature, children, className }: PlanGateProps) {
  const { hasAccess } = usePlan();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (hasAccess(plan)) {
    return <>{children}</>;
  }

  return (
    <>
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
              onClick={() => setOpen(true)}
            >
              Passer au {PLAN_LABELS[plan]}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Fonctionnalité bientôt disponible</DialogTitle>
            <DialogDescription>
              {feature} sera disponible dans le plan {PLAN_LABELS[plan]}.
              Laissez votre email pour être notifié en priorité dès l&apos;ouverture.
            </DialogDescription>
          </DialogHeader>
          {submitted ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <CheckCircle2 className="size-8 text-emerald-500" />
              <p className="text-sm font-medium text-slate-700">
                Merci ! Vous serez notifié dès que cette fonctionnalité sera disponible.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && email && setSubmitted(true)}
              />
              <Button
                className="bg-indigo-600 text-white hover:bg-indigo-700"
                disabled={!email}
                onClick={() => setSubmitted(true)}
              >
                Rejoindre la liste d&apos;attente
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
