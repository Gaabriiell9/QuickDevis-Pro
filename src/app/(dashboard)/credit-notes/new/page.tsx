"use client";

import { useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { useClients } from "@/hooks/use-clients";
import { formatMoney } from "@/lib/utils/money";

const itemSchema = z.object({
  description: z.string().min(1, "Description requise"),
  unit: z.string().optional(),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0),
  vatRate: z.coerce.number(),
});

const schema = z.object({
  clientId: z.string().min(1, "Client requis"),
  subject: z.string().optional(),
  issueDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "Au moins une ligne requise"),
});

type CreditNoteForm = z.infer<typeof schema>;

function calcTotals(items: { quantity: number; unitPrice: number; vatRate: number }[]) {
  let subtotal = 0;
  let vatAmount = 0;
  for (const item of items) {
    const s = (item.quantity || 0) * (item.unitPrice || 0);
    subtotal += s;
    vatAmount += s * ((item.vatRate || 20) / 100);
  }
  return { subtotal, vatAmount, total: subtotal + vatAmount };
}

export default function NewCreditNotePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: clientsData } = useClients({ pageSize: 100 } as any);

  const { register, control, handleSubmit, formState: { errors } } = useForm<CreditNoteForm>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      items: [{ description: "", quantity: 1, unitPrice: 0, vatRate: 20 }],
      issueDate: new Date().toISOString().split("T")[0],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchItems = useWatch({ control, name: "items" });
  const totals = calcTotals(watchItems ?? []);

  const onSubmit = async (data: CreditNoteForm) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/credit-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const b = await res.json();
        toast.error(b.error ?? "Erreur");
        return;
      }
      const cn = await res.json();
      toast.success("Avoir créé");
      router.push(`/credit-notes/${cn.id}`);
    } catch {
      toast.error("Erreur serveur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Nouvel avoir"
        breadcrumb={[{ label: "Avoirs", href: "/credit-notes" }, { label: "Nouveau" }]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Informations générales</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Client *</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                {...register("clientId")}
              >
                <option value="">Sélectionner un client</option>
                {clientsData?.data?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.type === "COMPANY"
                      ? c.companyName
                      : `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim()}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="text-sm text-destructive">{errors.clientId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Objet</Label>
              <Input {...register("subject")} placeholder="Objet de l'avoir" />
            </div>
            <div className="space-y-2">
              <Label>Date d&apos;émission</Label>
              <Input type="date" {...register("issueDate")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lignes</CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => append({ description: "", quantity: 1, unitPrice: 0, vatRate: 20 })}
            >
              <Plus className="mr-2 h-4 w-4" />Ajouter une ligne
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-end border-b pb-4">
                <div className="col-span-4 space-y-1">
                  {index === 0 && <Label className="text-xs">Description</Label>}
                  <Input {...register(`items.${index}.description`)} placeholder="Description" />
                </div>
                <div className="col-span-1 space-y-1">
                  {index === 0 && <Label className="text-xs">Unité</Label>}
                  <Input {...register(`items.${index}.unit`)} placeholder="u." />
                </div>
                <div className="col-span-2 space-y-1">
                  {index === 0 && <Label className="text-xs">Quantité</Label>}
                  <Input type="number" step="1" min="0" {...register(`items.${index}.quantity`)} />
                </div>
                <div className="col-span-2 space-y-1">
                  {index === 0 && <Label className="text-xs">Prix HT</Label>}
                  <Input type="number" step="1" min="0" {...register(`items.${index}.unitPrice`)} />
                </div>
                <div className="col-span-2 space-y-1">
                  {index === 0 && <Label className="text-xs">TVA %</Label>}
                  <Input type="number" step="1" min="0" max="100" {...register(`items.${index}.vatRate`)} />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex flex-col items-end gap-1 text-sm pt-2">
              <div className="flex gap-8">
                <span className="text-muted-foreground">Sous-total HT</span>
                <span>{formatMoney(totals.subtotal)}</span>
              </div>
              <div className="flex gap-8">
                <span className="text-muted-foreground">TVA</span>
                <span>{formatMoney(totals.vatAmount)}</span>
              </div>
              <div className="flex gap-8 font-bold text-base border-t pt-1">
                <span>Total TTC</span>
                <span>{formatMoney(totals.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea {...register("notes")} rows={3} placeholder="Notes internes..." />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer l&apos;avoir
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
