"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Package,
  Loader2,
  ChevronDown,
  ChevronUp,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useClients } from "@/hooks/use-clients";
import { useCurrentOrganization } from "@/hooks/use-current-organization";
import { ProductPickerDialog } from "@/components/shared/product-picker-dialog";
import { DocumentPreview, type PreviewData } from "@/components/editor/document-preview";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils/money";

// ─── Schema ───────────────────────────────────────────────────────────────────

const itemSchema = z.object({
  description: z.string().min(1, "Description requise"),
  unit: z.string().optional(),
  quantity: z.coerce.number().min(0),
  unitPrice: z.coerce.number().min(0),
  vatRate: z.coerce.number().min(0).max(100),
});

const schema = z.object({
  clientId: z.string().min(1, "Client requis"),
  subject: z.string().optional(),
  issueDate: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  items: z.array(itemSchema).min(1, "Au moins une ligne requise"),
});

type InvoiceEditForm = z.infer<typeof schema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcTotals(items: { quantity: number; unitPrice: number; vatRate: number }[]) {
  let subtotal = 0;
  let vatAmount = 0;
  for (const item of items) {
    const s = (item.quantity || 0) * (item.unitPrice || 0);
    subtotal += s;
    vatAmount += s * ((item.vatRate || 0) / 100);
  }
  return { subtotal, vatAmount, total: subtotal + vatAmount };
}

function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-slate-50/50 transition-colors"
      >
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</span>
        {open ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
      </button>
      {open && <div className="px-6 pb-5">{children}</div>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvoiceEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [openSections, setOpenSections] = useState({ client: true, title: true, items: true, conditions: true });
  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [now, setNow] = useState(() => new Date());
  const isInitialized = useRef(false);

  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  const { data: invoice, isLoading: invoiceLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/invoices/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });
  const { data: org } = useCurrentOrganization();
  const { data: clientsData } = useClients({ pageSize: 200 } as any);

  const form = useForm<InvoiceEditForm>({
    resolver: zodResolver(schema) as any,
    defaultValues: { items: [{ description: "", quantity: 1, unitPrice: 0, vatRate: 20 }] },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const watchAll = useWatch({ control: form.control });

  // Initialize form from loaded invoice
  useEffect(() => {
    if (!invoice || isInitialized.current) return;
    if (invoice.status === "PAID") {
      toast.error("Cette facture est payée et ne peut plus être modifiée");
      router.push(`/invoices/${id}`);
      return;
    }
    form.reset({
      clientId: invoice.clientId ?? "",
      subject: invoice.subject ?? "",
      issueDate: invoice.issueDate ? invoice.issueDate.split("T")[0] : "",
      dueDate: invoice.dueDate ? invoice.dueDate.split("T")[0] : "",
      notes: invoice.notes ?? "",
      termsAndConditions: invoice.termsAndConditions ?? "",
      items: invoice.items?.length
        ? invoice.items.map((item: any) => ({
            description: item.description,
            unit: item.unit ?? "",
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            vatRate: Number(item.vatRate),
          }))
        : [{ description: "", quantity: 1, unitPrice: 0, vatRate: 20 }],
    });
    setTimeout(() => { isInitialized.current = true; }, 150);
  }, [invoice, form, id, router]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const save = useCallback(async (data: InvoiceEditForm) => {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/v1/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Erreur");
      }
      setLastSavedAt(new Date());
      setSaveStatus("saved");
      form.reset(data);
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    } catch (err: any) {
      setSaveStatus("idle");
      toast.error(err.message ?? "Erreur lors de la sauvegarde");
    }
  }, [id, form, queryClient]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!form.formState.isDirty) return;
      form.handleSubmit(save)();
    }, 30000);
    return () => clearInterval(interval);
  }, [save, form]);

  const clients = (clientsData?.data ?? []) as any[];
  const selectedClient = clients.find((c) => c.id === watchAll.clientId) ?? null;
  const clientPreview = selectedClient
    ? {
        displayName:
          selectedClient.type === "COMPANY"
            ? selectedClient.companyName
            : `${selectedClient.firstName ?? ""} ${selectedClient.lastName ?? ""}`.trim(),
        address: selectedClient.address,
        postalCode: selectedClient.postalCode,
        city: selectedClient.city,
        email: selectedClient.email,
        phone: selectedClient.phone,
        siret: selectedClient.siret,
        vatNumber: selectedClient.vatNumber,
      }
    : null;

  const previewData: PreviewData = {
    type: "invoice",
    reference: invoice?.reference ?? "—",
    status: invoice?.status ?? "DRAFT",
    subject: watchAll.subject,
    issueDate: watchAll.issueDate,
    dueDate: watchAll.dueDate,
    notes: watchAll.notes,
    termsAndConditions: watchAll.termsAndConditions,
    org: {
      name: org?.name ?? "",
      address: org?.address,
      postalCode: org?.postalCode,
      city: org?.city,
      phone: org?.phone,
      email: org?.email,
      siret: org?.siret,
      vatNumber: org?.vatNumber,
    },
    client: clientPreview,
    items: (watchAll.items ?? []).map((item: any) => ({
      description: item.description ?? "",
      unit: item.unit,
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
      vatRate: Number(item.vatRate) || 0,
    })),
    currency: org?.currency ?? "EUR",
  };

  const totals = calcTotals(previewData.items);

  const savedLabel = (() => {
    if (saveStatus === "saving") return "Sauvegarde en cours...";
    if (!lastSavedAt) return null;
    const diff = Math.floor((now.getTime() - lastSavedAt.getTime()) / 60000);
    if (diff === 0) return "Sauvegardé à l'instant";
    if (diff === 1) return "Sauvegardé il y a 1 min";
    return `Sauvegardé il y a ${diff} min`;
  })();

  function handleProductSelect(product: { name: string; unit?: string | null; unitPrice: number | string; vatRate: number | string }) {
    if (pickerIndex === null) return;
    form.setValue(`items.${pickerIndex}.description`, product.name);
    form.setValue(`items.${pickerIndex}.unit`, product.unit ?? "");
    form.setValue(`items.${pickerIndex}.unitPrice`, Number(product.unitPrice));
    form.setValue(`items.${pickerIndex}.vatRate`, Number(product.vatRate));
  }

  if (invoiceLoading) {
    return (
      <div className="-m-6 h-[calc(100vh-4rem)] flex items-center justify-center bg-white">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="-m-6 h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-white">
      <ProductPickerDialog
        open={pickerIndex !== null}
        onOpenChange={(open) => { if (!open) setPickerIndex(null); }}
        onSelect={handleProductSelect}
      />

      {/* ── Editor header ── */}
      <header className="flex items-center justify-between h-14 px-5 border-b border-slate-100 bg-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/invoices/${id}`} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm transition-colors">
            <ArrowLeft className="size-4" />
            Retour
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-sm font-semibold text-slate-800 truncate">
            {invoice?.reference ?? "Édition de la facture"}
          </span>
          {savedLabel && (
            <span className={cn("text-xs hidden sm:block", saveStatus === "saving" ? "text-amber-500" : "text-slate-400")}>
              · {savedLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saveStatus === "saving"}
            onClick={() => form.handleSubmit(save)()}
            className="gap-1.5"
          >
            {saveStatus === "saving" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            Enregistrer
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => {
              form.handleSubmit(async (data) => {
                await save(data);
                router.push(`/invoices/${id}`);
              })();
            }}
          >
            Finaliser
          </Button>
        </div>
      </header>

      {/* ── Split body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: form */}
        <div className="w-1/2 overflow-y-auto border-r border-slate-100">
          <form onSubmit={form.handleSubmit(save)} className="divide-y divide-slate-100">

            {/* Client */}
            <Section title="Client" open={openSections.client} onToggle={() => toggleSection("client")}>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Client *</Label>
                <select
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  {...form.register("clientId")}
                >
                  <option value="">Sélectionner un client...</option>
                  {clients.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.type === "COMPANY" ? c.companyName : `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim()}
                    </option>
                  ))}
                </select>
                {form.formState.errors.clientId && (
                  <p className="text-xs text-destructive">{form.formState.errors.clientId.message}</p>
                )}
              </div>
            </Section>

            {/* Titre */}
            <Section title="Informations" open={openSections.title} onToggle={() => toggleSection("title")}>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">Objet / titre</Label>
                  <Input {...form.register("subject")} placeholder="Ex: Prestation de conseil — Mars 2025" className="h-10" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">Date d'émission</Label>
                    <Input type="date" {...form.register("issueDate")} className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">Date d'échéance</Label>
                    <Input type="date" {...form.register("dueDate")} className="h-10" />
                  </div>
                </div>
              </div>
            </Section>

            {/* Articles */}
            <Section title="Articles" open={openSections.items} onToggle={() => toggleSection("items")}>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-1 px-1">
                  <p className="col-span-5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Description</p>
                  <p className="col-span-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Unité</p>
                  <p className="col-span-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-right">Qté</p>
                  <p className="col-span-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-right">Prix HT</p>
                  <p className="col-span-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-right">TVA%</p>
                  <div className="col-span-1" />
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-1 items-center">
                    <div className="col-span-5">
                      <div className="flex gap-1">
                        <Input
                          {...form.register(`items.${index}.description`)}
                          placeholder="Description"
                          className="h-9 text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0 text-slate-400 hover:text-indigo-600"
                          title="Choisir depuis le catalogue"
                          onClick={() => setPickerIndex(index)}
                        >
                          <Package className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Input {...form.register(`items.${index}.unit`)} placeholder="h" className="h-9 text-sm text-center px-1" />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number" step="0.01" min="0"
                        {...form.register(`items.${index}.quantity`)}
                        className="h-9 text-sm text-right"
                        onFocus={(e) => e.target.select()}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number" step="0.01" min="0"
                        {...form.register(`items.${index}.unitPrice`)}
                        className="h-9 text-sm text-right"
                        onFocus={(e) => e.target.select()}
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number" step="1" min="0" max="100"
                        {...form.register(`items.${index}.vatRate`)}
                        className="h-9 text-sm text-right"
                        onFocus={(e) => e.target.select()}
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-300 hover:text-destructive"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 border-dashed text-slate-500 hover:text-slate-700"
                  onClick={() => append({ description: "", quantity: 1, unitPrice: 0, vatRate: 20 })}
                >
                  <Plus className="size-3.5 mr-1.5" />
                  Nouvelle ligne
                </Button>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Total HT</span>
                    <span>{formatMoney(totals.subtotal, org?.currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>TVA</span>
                    <span>{formatMoney(totals.vatAmount, org?.currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 border-t pt-1.5">
                    <span>Total TTC</span>
                    <span className="text-indigo-600">{formatMoney(totals.total, org?.currency)}</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Conditions */}
            <Section title="Conditions" open={openSections.conditions} onToggle={() => toggleSection("conditions")}>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">Conditions de règlement</Label>
                  <Textarea
                    {...form.register("termsAndConditions")}
                    rows={3}
                    placeholder={"Délai de paiement : 30 jours\nPénalité de retard : 3x le taux légal"}
                    className="text-sm resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">Notes</Label>
                  <Textarea
                    {...form.register("notes")}
                    rows={3}
                    placeholder="Informations complémentaires..."
                    className="text-sm resize-none"
                  />
                </div>
              </div>
            </Section>
          </form>
        </div>

        {/* Right: live preview */}
        <div className="w-1/2 overflow-y-auto bg-slate-100">
          <div className="p-6">
            <DocumentPreview data={previewData} />
          </div>
        </div>
      </div>
    </div>
  );
}
