"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/utils/money";
import { formatDateShort } from "@/lib/utils/dates";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants/payment-methods";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
    const res = await fetch(`/api/v1/invoices/${id}/mark-paid`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) { toast.error("Impossible de marquer la facture comme payée"); return; }
    toast.success("Facture marquée comme payée");
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
      toast.success("PDF téléchargé !");
    } catch {
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setPdfLoading(false);
    }
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
      toast.success("Facture envoyée par email");
      setSendOpen(false);
      qc.invalidateQueries({ queryKey: ["invoice", id] });
    } catch { toast.error("Une erreur est survenue lors de l'envoi"); }
    finally { setSendLoading(false); }
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!invoice) return <p>Facture introuvable.</p>;

  const clientName =
    invoice.client?.companyName ??
    `${invoice.client?.firstName ?? ""} ${invoice.client?.lastName ?? ""}`.trim();

  const clientEmail = invoice.client?.email ?? "";

  return (
    <div className="space-y-6 max-w-4xl animate-in">
      {/* Dialog envoi email */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Envoyer la facture par email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Destinataire</Label>
              <input
                type="email"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                placeholder="client@exemple.fr"
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                rows={5}
                value={sendMessage}
                onChange={(e) => setSendMessage(e.target.value)}
                placeholder={`Bonjour,\n\nVeuillez trouver ci-joint votre facture ${invoice.reference}.\n\nCordialement`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendOpen(false)}>Annuler</Button>
            <Button onClick={handleSendEmail} disabled={sendLoading}>
              {sendLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PageHeader
        title={invoice.reference}
        description={clientName}
        breadcrumb={[{ label: "Factures", href: "/invoices" }, { label: invoice.reference }]}
        action={
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setSendTo(clientEmail); setSendOpen(true); }}
            >
              <Mail className="mr-2 h-4 w-4" />
              Envoyer par email
            </Button>
            <Button
              onClick={downloadPdf}
              size="sm"
              variant="outline"
              disabled={pdfLoading}
            >
              {pdfLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 h-4 w-4" />
              )}
              Télécharger PDF
            </Button>
            {invoice.status !== "PAID" && (
              <>
                <Button asChild size="sm">
                  <Link href={`/invoices/${id}/payments`}>
                    Enregistrer un paiement
                  </Link>
                </Button>
                <Button onClick={handleMarkPaid} size="sm" variant="outline">
                  Marquer payée
                </Button>
              </>
            )}
            <StatusBadge status={invoice.status} type="invoice" />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Client :</span> {clientName}</p>
            <p>
              <span className="text-muted-foreground">Émis le :</span>{" "}
              {formatDateShort(invoice.issueDate)}
            </p>
            {invoice.dueDate && (
              <p>
                <span className="text-muted-foreground">Échéance :</span>{" "}
                {formatDateShort(invoice.dueDate)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Totaux</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total TTC</span>
              <span className="font-bold">{formatMoney(Number(invoice.total))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payé</span>
              <span className="text-emerald-600">
                {formatMoney(Number(invoice.amountPaid))}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Reste dû</span>
              <span
                className={`font-bold ${
                  Number(invoice.amountDue) > 0 ? "text-amber-600" : "text-emerald-600"
                }`}
              >
                {formatMoney(Number(invoice.amountDue))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Lignes</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Qté</TableHead>
                <TableHead>Prix HT</TableHead>
                <TableHead>TVA</TableHead>
                <TableHead className="text-right">Total HT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    {Number(item.quantity)} {item.unit ?? ""}
                  </TableCell>
                  <TableCell>{formatMoney(Number(item.unitPrice))}</TableCell>
                  <TableCell>{Number(item.vatRate)}%</TableCell>
                  <TableCell className="text-right">
                    {formatMoney(Number(item.subtotal))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {invoice.payments?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Paiements</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {invoice.payments.map((p: any) => (
              <div
                key={p.id}
                className="flex justify-between py-2 border-b last:border-0 text-sm"
              >
                <span>{formatDateShort(p.date)}</span>
                <span>{PAYMENT_METHOD_LABELS[p.method] ?? p.method}</span>
                {p.reference && (
                  <span className="text-muted-foreground">{p.reference}</span>
                )}
                <span className="font-medium text-emerald-600">
                  {formatMoney(Number(p.amount))}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
