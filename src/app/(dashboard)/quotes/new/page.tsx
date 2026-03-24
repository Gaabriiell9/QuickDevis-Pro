"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { useClients } from "@/hooks/use-clients";
import { formatMoney } from "@/lib/utils/money";
import { ProductPickerDialog } from "@/components/shared/product-picker-dialog";

const itemSchema = z.object({
  description: z.string().min(1, "Description requise"),
  unit: z.string().optional(),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0),
  vatRate: z.coerce.number().default(20),
});

const schema = z.object({
  clientId: z.string().min(1, "Client requis"),
  subject: z.string().optional(),
  issueDate: z.string().optional(),
  validUntilDate: z.string().optional(),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  templateId: z.string().optional(),
  items: z.array(itemSchema).min(1, "Au moins une ligne requise"),
});

type QuoteForm = z.infer<typeof schema>;

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

export default function NewQuotePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const { data: clientsData } = useClients({ pageSize: 100 } as any);

  useEffect(() => {
    fetch("/api/v1/templates?type=QUOTE", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const list = d.data ?? [];
        setTemplates(list);
        const defaultTpl = list.find((t: any) => t.isDefault);
        if (defaultTpl) setValue("templateId", defaultTpl.id);
      });
  }, [setValue]);

  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<QuoteForm>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      items: [{ description: "", quantity: 1, unitPrice: 0, vatRate: 20 }],
      issueDate: new Date().toISOString().split("T")[0],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchItems = useWatch({ control, name: "items" });
  const totals = calcTotals(watchItems ?? []);

  const onSubmit = async (data: QuoteForm) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) { const b = await res.json(); toast.error(b.error ?? "Erreur"); return; }
      const quote = await res.json();
      toast.success("Devis créé");
      await queryClient.invalidateQueries({ queryKey: ["quotes"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      router.push(`/quotes/${quote.id}`);
    } catch { toast.error("Erreur serveur"); }
    finally { setIsLoading(false); }
  };

  function handleProductSelect(product: { name: string; unit?: string | null; unitPrice: number | string; vatRate: number | string }) {
    if (pickerIndex === null) return;
    setValue(`items.${pickerIndex}.description`, product.name);
    setValue(`items.${pickerIndex}.unit`, product.unit ?? "");
    setValue(`items.${pickerIndex}.unitPrice`, Number(product.unitPrice));
    setValue(`items.${pickerIndex}.vatRate`, Number(product.vatRate));
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <ProductPickerDialog
        open={pickerIndex !== null}
        onOpenChange={(open) => { if (!open) setPickerIndex(null); }}
        onSelect={handleProductSelect}
      />
      <PageHeader title="Nouveau devis" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Informations générales</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Client *</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" {...register("clientId")}>
                <option value="">Sélectionner un client</option>
                {clientsData?.data?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.type === "COMPANY" ? c.companyName : `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim()}
                  </option>
                ))}
              </select>
              {errors.clientId && <p className="text-sm text-destructive">{errors.clientId.message}</p>}
            </div>
            <div className="space-y-2"><Label>Objet</Label><Input {...register("subject")} placeholder="Objet du devis" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date d'émission</Label><Input type="date" {...register("issueDate")} /></div>
              <div className="space-y-2"><Label>Date de validité</Label><Input type="date" {...register("validUntilDate")} /></div>
            </div>
            <div className="space-y-2">
              <Label>Template PDF</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" {...register("templateId")}>
                <option value="">Template par défaut</option>
                {templates.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}{t.isDefault ? " (défaut)" : ""}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lignes</CardTitle>
            <Button type="button" size="sm" variant="outline" onClick={() => append({ description: "", quantity: 1, unitPrice: 0, vatRate: 20 })}>
              <Plus className="mr-2 h-4 w-4" />Ajouter une ligne
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-end border-b pb-4">
                <div className="col-span-4 space-y-1">
                  {index === 0 && <Label className="text-xs">Description</Label>}
                  <div className="flex gap-1">
                    <Input {...register(`items.${index}.description`)} placeholder="Description" />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      title="Choisir un produit"
                      onClick={() => setPickerIndex(index)}
                    >
                      <Package className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="col-span-1 space-y-1">
                  {index === 0 && <Label className="text-xs">Unité</Label>}
                  <Input {...register(`items.${index}.unit`)} placeholder="u." />
                </div>
                <div className="col-span-2 space-y-1">
                  {index === 0 && <Label className="text-xs">Quantité</Label>}
                  <Input type="number" step="1" min="0" onFocus={(e) => e.target.select()} {...register(`items.${index}.quantity`)} />
                </div>
                <div className="col-span-2 space-y-1">
                  {index === 0 && <Label className="text-xs">Prix HT</Label>}
                  <Input type="number" step="1" min="0" onFocus={(e) => e.target.select()} {...register(`items.${index}.unitPrice`)} />
                </div>
                <div className="col-span-2 space-y-1">
                  {index === 0 && <Label className="text-xs">TVA %</Label>}
                  <Input type="number" step="1" min="0" max="100" onFocus={(e) => e.target.select()} {...register(`items.${index}.vatRate`)} />
                </div>
                <div className="col-span-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex flex-col items-end gap-1 text-sm pt-2">
              <div className="flex gap-8"><span className="text-muted-foreground">Sous-total HT</span><span>{formatMoney(totals.subtotal)}</span></div>
              <div className="flex gap-8"><span className="text-muted-foreground">TVA</span><span>{formatMoney(totals.vatAmount)}</span></div>
              <div className="flex gap-8 font-bold text-base border-t pt-1"><span>Total TTC</span><span>{formatMoney(totals.total)}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes et conditions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Notes</Label><Textarea {...register("notes")} rows={3} /></div>
            <div className="space-y-2"><Label>Conditions de règlement</Label><Textarea {...register("termsAndConditions")} rows={3} /></div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer le devis
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
        </div>
      </form>
    </div>
  );
}
