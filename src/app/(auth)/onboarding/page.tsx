"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Building2, FileText, MapPin, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const steps = [
  { id: 1, title: "Entreprise", icon: Building2 },
  { id: 2, title: "Légal", icon: FileText },
  { id: 3, title: "Adresse", icon: MapPin },
  { id: 4, title: "Préférences", icon: Settings },
];

const onboardingSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  siret: z.string().optional(),
  vatNumber: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  currency: z.string().optional(),
  locale: z.string().optional(),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { currency: "EUR", locale: "fr-FR", country: "FR" },
  });

  const nextStep = async () => {
    const valid = await trigger();
    if (valid) setStep((s) => Math.min(s + 1, 4));
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
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-between">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? "✓" : <Icon className="h-4 w-4" />}
              </div>
              <span
                className={`ml-2 text-sm hidden sm:block ${
                  isActive ? "font-medium" : "text-muted-foreground"
                }`}
              >
                {s.title}
              </span>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px bg-border mx-3 w-8" />
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Votre entreprise</CardTitle>
              <CardDescription>
                Informations de base sur votre structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la société *</Label>
                <Input id="name" placeholder="Ma Société SAS" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email professionnel</Label>
                <Input id="email" type="email" placeholder="contact@exemple.fr" {...register("email")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" placeholder="01 23 45 67 89" {...register("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Site web</Label>
                <Input id="website" placeholder="https://monsite.fr" {...register("website")} />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Informations légales</CardTitle>
              <CardDescription>
                Numéros d&apos;identification de votre entreprise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siret">SIRET</Label>
                <Input id="siret" placeholder="123 456 789 00012" {...register("siret")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vatNumber">Numéro de TVA intracommunautaire</Label>
                <Input id="vatNumber" placeholder="FR12345678901" {...register("vatNumber")} />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Adresse</CardTitle>
              <CardDescription>
                Adresse de votre siège social
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" placeholder="1 rue de la Paix" {...register("address")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input id="postalCode" placeholder="75001" {...register("postalCode")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" placeholder="Paris" {...register("city")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input id="country" placeholder="FR" {...register("country")} />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Préférences</CardTitle>
              <CardDescription>
                Paramètres par défaut pour vos documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <Input id="currency" placeholder="EUR" {...register("currency")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locale">Langue</Label>
                <Input id="locale" placeholder="fr-FR" {...register("locale")} />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 mt-4">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1"
            >
              Précédent
            </Button>
          )}
          {step < 4 ? (
            <Button type="button" onClick={nextStep} className="flex-1">
              Suivant
            </Button>
          ) : (
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Terminer la configuration
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
