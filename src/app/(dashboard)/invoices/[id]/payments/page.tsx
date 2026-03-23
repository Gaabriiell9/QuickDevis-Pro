"use client";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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
  amount: z.number().positive("Montant requis"),
  date: z.string().min(1, "Date requise"),
  method: z.enum(["BANK_TRANSFER", "CASH", "CARD", "CHECK", "OTHER"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentForm = z.infer<typeof schema>;

export default function RegisterPaymentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<PaymentForm>({
    resolver: zodResolver(schema),
    defaultValues: { method: "BANK_TRANSFER", date: new Date().toISOString().split("T")[0] },
  });

  const onSubmit = async (data: PaymentForm) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/invoices/${id}/register-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) { const b = await res.json(); toast.error(b.error ?? "Erreur"); return; }
      toast.success("Paiement enregistré");
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      router.push(`/invoices/${id}`);
    } catch { toast.error("Erreur serveur"); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-lg space-y-6">
      <PageHeader title="Enregistrer un paiement" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader><CardTitle>Détails du paiement</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Montant *</Label>
              <Input type="number" step="1" min="0" {...register("amount", { valueAsNumber: true })} placeholder="0,00" />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" {...register("date")} />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Méthode</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" {...register("method")}>
                <option value="BANK_TRANSFER">Virement bancaire</option>
                <option value="CASH">Espèces</option>
                <option value="CARD">Carte bancaire</option>
                <option value="CHECK">Chèque</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Référence</Label><Input {...register("reference")} placeholder="Réf. virement..." /></div>
            <div className="space-y-2"><Label>Notes</Label><Textarea {...register("notes")} rows={2} /></div>
          </CardContent>
        </Card>

        <div className="flex gap-3 mt-4">
          <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
        </div>
      </form>
    </div>
  );
}
