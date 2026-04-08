"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

const schema = z.object({
  type: z.enum(["INDIVIDUAL", "COMPANY"]),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  vatNumber: z.string().optional(),
  siret: z.string().optional(),
  notes: z.string().optional(),
});

type ClientForm = z.infer<typeof schema>;

export default function NewClientPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, setValue } = useForm<ClientForm>({
    resolver: zodResolver(schema),
    defaultValues: { type: "INDIVIDUAL", country: "FR" },
  });

  const type = watch("type");

  const onSubmit = async (data: ClientForm) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        toast.error(body.message ?? body.error ?? "Erreur");
        return;
      }
      const client = await res.json();
      toast.success("Client créé");
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["plan-usage"] });
      router.push(`/clients/${client.id}`);
    } catch {
      toast.error("Erreur serveur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Nouveau client" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Identité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button
                type="button"
                variant={type === "INDIVIDUAL" ? "default" : "outline"}
                onClick={() => setValue("type", "INDIVIDUAL")}
              >
                Particulier
              </Button>
              <Button
                type="button"
                variant={type === "COMPANY" ? "default" : "outline"}
                onClick={() => setValue("type", "COMPANY")}
              >
                Société
              </Button>
            </div>
            {type === "INDIVIDUAL" ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input {...register("firstName")} placeholder="Jean" />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input {...register("lastName")} placeholder="Dupont" />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Nom de la société</Label>
                <Input {...register("companyName")} placeholder="Ma Société SAS" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register("email")} placeholder="contact@exemple.fr" />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input {...register("phone")} placeholder="01 23 45 67 89" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Adresse</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input {...register("address")} placeholder="1 rue de la Paix" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code postal</Label>
                <Input {...register("postalCode")} placeholder="75001" />
              </div>
              <div className="space-y-2">
                <Label>Ville</Label>
                <Input {...register("city")} placeholder="Paris" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pays</Label>
              <Input {...register("country")} placeholder="FR" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Légal</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>SIRET</Label>
              <Input {...register("siret")} placeholder="123 456 789 00012" />
            </div>
            <div className="space-y-2">
              <Label>Numéro de TVA</Label>
              <Input {...register("vatNumber")} placeholder="FR12345678901" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea {...register("notes")} placeholder="Informations complémentaires..." rows={3} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer le client
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
