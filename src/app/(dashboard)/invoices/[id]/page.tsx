"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/utils/money";
import { formatDateShort } from "@/lib/utils/dates";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants/payment-methods";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, Loader2, Mail, Pencil, CreditCard } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendTo, setSendTo] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [sendLoading, setSendLoading] = useState(false);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/invoices/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const handleMarkPaid = async () => {
    const res = await fetch(`/api/v1/invoices/${id}/mark-paid`, { method: "POST", credentials: "include" });
    if (!res.ok) { toast.error("Impossible de marquer la facture comme payee"); return; }
    toast.success("Facture marquee comme payee");
    qc.invalidateQueries({ queryKey: ["invoice", id] });
  };

  const downloadPdf = async () => {
    setPdfLoading(true);
    try {
      const res = await fetch(`/api/v1/invoices/${id}/pdf-data`, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      const { generateInvoicePdf } = await import("@/lib/pdf/generate-invoice-pdf");
      generateInvoicePdf(data);
      toast.success("PDF telecharge");
    } catch { toast.error("Erreur lors de la generation du PDF"); }
    finally { setPdfLoading(false); }
  };

  const handleSendEmail = async () => {
    if (!sendTo) { toast.error("Destinataire requis"); return; }
    setSendLoading(true);
    try {
      const res = await fetch(`/api/v1/invoices/${id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ to: sendTo, message: sendMessage }),
      });
      if (!res.ok) { toast.error("Erreur lors de l'envoi"); return; }
      toast.success("Facture envoyee par email");
      setSendOpen(false);
      qc.invalidateQueries({ queryKey: ["invoice", id] });
    } catch { toast.error("Une erreur est survenue"); }
    finally { setSendLoading(false); }
  };

  if (isLoading) return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-64" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-64" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-40" />
        </div>
      </div>
    </div>
  );
  if (!invoice) return <p className="text-slate-500">Facture introuvable.</p>;

  const clientName = invoice.client?.companyName ?? `${invoice.client?.firstName ?? ""} ${invoice.client?.lastName ?? ""}`.trim();
  const clientEmail = invoice.client?.email ?? "";

  return (
    <div className="max-w-6xl">
      {/* Dialog envoi email */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Envoyer la facture par email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Destinataire</Label>
              <Input type="email" placeholder="client@exemple.fr" value={sendTo} onChange={(e) => setSendTo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea rows={5} value={sendMessage} onChange={(e) => setSendMessage(e.target.value)} placeholder={`Bonjour,\n\nVeuillez trouver ci-joint votre facture ${invoice.reference}.\n\nCordialement`} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendOpen(false)}>Annuler</Button>
            <Button onClick={handleSendEmail} disabled={sendLoading} className="bg-indigo-600 hover:bg-indigo-700">
              {sendLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PageHeader
        title={invoice.reference}
        breadcrumb={[{ label: "Factures", href: "/invoices" }, { label: invoice.reference }]}
        action={<StatusBadge status={invoice.status} type="invoice" />}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-4">
          {/* Infos */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Informations</h2>
            </div>
            <div className="px-5 py-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Client</p>
                <p className="font-medium text-slate-800">{clientName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Statut</p>
                <StatusBadge status={invoice.status} type="invoice" />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Date d&apos;emission</p>
                <p className="text-slate-700">{formatDateShort(invoice.issueDate)}</p>
              </div>
              {invoice.dueDate && (
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Echeance</p>
                  <p className="text-slate-700">{formatDateShort(invoice.dueDate)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Lignes */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Lignes de facturation</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="text-xs font-medium text-slate-500 uppercase pl-5">Description</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 uppercase">Qte</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 uppercase">Prix HT</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 uppercase">TVA</TableHead>
                  <TableHead className="text-xs font-medium text-slate-500 uppercase text-right pr-5">Total HT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items?.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-slate-50">
                    <TableCell className="pl-5 font-medium text-slate-800">{item.description}</TableCell>
                    <TableCell className="text-slate-600">{Number(item.quantity)} {item.unit ?? ""}</TableCell>
                    <TableCell className="text-slate-600">{formatMoney(Number(item.unitPrice))}</TableCell>
                    <TableCell className="text-slate-600">{Number(item.vatRate)}%</TableCell>
                    <TableCell className="text-right pr-5 font-medium text-slate-800">{formatMoney(Number(item.subtotal))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paiements */}
          {invoice.payments?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-800">Historique des paiements</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {invoice.payments.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span className="text-slate-500">{formatDateShort(p.date)}</span>
                    <span className="text-slate-600">{PAYMENT_METHOD_LABELS[p.method] ?? p.method}</span>
                    {p.reference && <span className="text-slate-400 font-mono text-xs">{p.reference}</span>}
                    <span className="font-semibold text-emerald-600 tabular-nums">{formatMoney(Number(p.amount))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right col */}
        <div className="space-y-4">
          {/* Totaux */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Totaux</h2>
            </div>
            <div className="px-5 py-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Total TTC</span>
                <span className="tabular-nums font-semibold text-slate-800">{formatMoney(Number(invoice.total))}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Paye</span>
                <span className="tabular-nums text-emerald-600 font-medium">{formatMoney(Number(invoice.amountPaid))}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2.5 mt-2.5">
                <span className="font-semibold text-slate-800">Reste du</span>
                <span className={`tabular-nums font-bold text-base ${Number(invoice.amountDue) > 0 ? "text-orange-600" : "text-emerald-600"}`}>
                  {formatMoney(Number(invoice.amountDue))}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              {invoice.status !== "PAID" && (
                <Button size="sm" variant="outline" asChild className="w-full justify-start h-9">
                  <Link href={`/invoices/${id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Modifier
                  </Link>
                </Button>
              )}
              <Button size="sm" variant="outline" className="w-full justify-start h-9" onClick={() => { setSendTo(clientEmail); setSendOpen(true); }}>
                <Mail className="mr-2 h-4 w-4" />
                Envoyer par email
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start h-9" onClick={downloadPdf} disabled={pdfLoading}>
                {pdfLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                Telecharger PDF
              </Button>
              {invoice.status !== "PAID" && (
                <>
                  <Button size="sm" asChild className="w-full justify-start h-9 bg-indigo-600 hover:bg-indigo-700">
                    <Link href={`/invoices/${id}/payments`}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Enregistrer un paiement
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start h-9 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={handleMarkPaid}>
                    Marquer payee
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
