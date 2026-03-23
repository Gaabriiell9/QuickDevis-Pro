"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

const schema = z.object({
  quotePrefix: z.string().default("DEV"),
  invoicePrefix: z.string().default("FAC"),
  creditNotePrefix: z.string().default("AVO"),
  quoteValidityDays: z.coerce.number().default(30),
  invoicePaymentDays: z.coerce.number().default(30),
  defaultNotes: z.string().optional(),
  defaultTerms: z.string().optional(),
});

type DocSettingsForm = z.infer<typeof schema>;

export default function DocumentSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm<DocSettingsForm>({
    resolver: zodResolver(schema) as any,
    defaultValues: { quotePrefix: "DEV", invoicePrefix: "FAC", creditNotePrefix: "AVO", quoteValidityDays: 30, invoicePaymentDays: 30 },
  });

  const onSubmit = async (data: DocSettingsForm) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      toast.success("Paramètres sauvegardés");
    } catch { toast.error("Erreur"); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Paramètres — Documents" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Numérotation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Préfixe devis</Label><Input {...register("quotePrefix")} /></div>
              <div className="space-y-2"><Label>Préfixe facture</Label><Input {...register("invoicePrefix")} /></div>
              <div className="space-y-2"><Label>Préfixe avoir</Label><Input {...register("creditNotePrefix")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Validité devis (jours)</Label><Input type="number" step="1" min="0" {...register("quoteValidityDays")} /></div>
              <div className="space-y-2"><Label>Délai paiement (jours)</Label><Input type="number" step="1" min="0" {...register("invoicePaymentDays")} /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Textes par défaut</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Notes par défaut</Label><Textarea {...register("defaultNotes")} rows={3} /></div>
            <div className="space-y-2"><Label>CGV par défaut</Label><Textarea {...register("defaultTerms")} rows={4} /></div>
          </CardContent>
        </Card>
        <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer</Button>
      </form>
    </div>
  );
}
