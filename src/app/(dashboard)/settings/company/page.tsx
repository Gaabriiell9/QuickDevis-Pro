"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { useCurrentOrganization } from "@/hooks/use-current-organization";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

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
  const [logo, setLogo] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset } = useForm<OrgForm>({ resolver: zodResolver(schema) as any });

  useEffect(() => {
    if (org) {
      reset(org);
      setLogo(org.logo ?? null);
    }
  }, [org, reset]);

  const onSubmit = async (data: OrgForm) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Paramètres sauvegardés");
      qc.invalidateQueries({ queryKey: ["organization"] });
    } catch { toast.error("Erreur lors de la sauvegarde"); }
    finally { setIsLoading(false); }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (file.size > 2 * 1024 * 1024) { toast.error("Fichier trop lourd (max 2 Mo)"); return; }
    if (!ALLOWED_TYPES.includes(file.type)) { toast.error("Seuls les formats JPG, PNG, WebP et SVG sont acceptés"); return; }

    setLogoLoading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      try {
        const res = await fetch("/api/v1/organization", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ logo: base64 }),
        });
        if (!res.ok) throw new Error();
        setLogo(base64);
        toast.success("Logo enregistré");
        qc.invalidateQueries({ queryKey: ["organization"] });
      } catch { toast.error("Erreur lors de l'upload"); }
      finally { setLogoLoading(false); }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveLogo = async () => {
    setLogoLoading(true);
    try {
      const res = await fetch("/api/v1/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ logo: null }),
      });
      if (!res.ok) throw new Error();
      setLogo(null);
      toast.success("Logo supprimé");
      qc.invalidateQueries({ queryKey: ["organization"] });
    } catch { toast.error("Erreur lors de la suppression"); }
    finally { setLogoLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Paramètres — Entreprise" />

      {/* Logo */}
      <Card>
        <CardHeader><CardTitle>Logo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Affiché en haut à gauche de vos devis et factures. JPG, PNG ou SVG, max 2 Mo.
          </p>
          <div className="flex items-center gap-4">
            {logo ? (
              <div className="relative w-32 h-16 border rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
                <Image src={logo} alt="Logo entreprise" fill className="object-contain p-1" sizes="128px" />
              </div>
            ) : (
              <div className="w-32 h-16 border-2 border-dashed rounded-lg flex items-center justify-center bg-slate-50 text-slate-400 text-xs text-center px-2">
                Aucun logo
              </div>
            )}
            <div className="flex flex-col gap-2">
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" className="hidden" onChange={handleLogoChange} />
              <Button type="button" variant="outline" size="sm" disabled={logoLoading} onClick={() => fileRef.current?.click()}>
                {logoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {logo ? "Changer le logo" : "Uploader un logo"}
              </Button>
              {logo && (
                <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={logoLoading} onClick={handleRemoveLogo}>
                  <X className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer
        </Button>
      </form>
    </div>
  );
}
