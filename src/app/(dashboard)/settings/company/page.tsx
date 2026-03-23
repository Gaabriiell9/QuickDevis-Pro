"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { useCurrentOrganization } from "@/hooks/use-current-organization";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  siret: z.string().optional(),
  vatNumber: z.string().optional(),
});

type OrgForm = z.infer<typeof schema>;

export default function CompanySettingsPage() {
  const { data: org } = useCurrentOrganization();
  const qc = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm<OrgForm>({ resolver: zodResolver(schema) });

  useEffect(() => { if (org) reset(org); }, [org, reset]);

  const onSubmit = async (data: OrgForm) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/organization", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      toast.success("Paramètres sauvegardés");
      qc.invalidateQueries({ queryKey: ["organization"] });
    } catch { toast.error("Erreur lors de la sauvegarde"); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Paramètres — Entreprise" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Nom</Label><Input {...register("name")} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" {...register("email")} /></div>
            <div className="space-y-2"><Label>Téléphone</Label><Input {...register("phone")} /></div>
            <div className="space-y-2"><Label>Site web</Label><Input {...register("website")} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Adresse</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Adresse</Label><Input {...register("address")} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Code postal</Label><Input {...register("postalCode")} /></div>
              <div className="space-y-2"><Label>Ville</Label><Input {...register("city")} /></div>
            </div>
            <div className="space-y-2"><Label>Pays</Label><Input {...register("country")} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Légal</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>SIRET</Label><Input {...register("siret")} /></div>
            <div className="space-y-2"><Label>N° TVA</Label><Input {...register("vatNumber")} /></div>
          </CardContent>
        </Card>
        <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer</Button>
      </form>
    </div>
  );
}
