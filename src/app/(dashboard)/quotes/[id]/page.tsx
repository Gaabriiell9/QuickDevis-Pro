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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, Loader2, Mail, Pencil } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendTo, setSendTo] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [sendLoading, setSendLoading] = useState(false);

  const { data: quote, isLoading } = useQuery({
    queryKey: ["quote", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/quotes/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const ACTION_MESSAGES: Record<string, { success: string; error: string }> = {
    accept:    { success: "Devis accepté",    error: "Impossible d'accepter ce devis" },
    reject:    { success: "Devis refusé",     error: "Impossible de refuser ce devis" },
    duplicate: { success: "Devis dupliqué",   error: "Impossible de dupliquer ce devis" },
  };

  const handleAction = async (action: string, redirectTo?: string) => {
    const res = await fetch(`/api/v1/quotes/${id}/${action}`, {
      method: "POST",
      credentials: "include",
    });
    const msg = ACTION_MESSAGES[action];
    if (!res.ok) { toast.error(msg?.error ?? "Une erreur est survenue"); return; }
    toast.success(msg?.success ?? "Action effectuée");
    qc.invalidateQueries({ queryKey: ["quote", id] });
    if (redirectTo) router.push(redirectTo);
  };

  const handleConvert = async () => {
    const res = await fetch(`/api/v1/quotes/${id}/convert-to-invoice`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) { toast.error("Erreur lors de la conversion"); return; }
    const inv = await res.json();
    toast.success("Facture créée");
    router.push(`/invoices/${inv.id}`);
  };

  const downloadPdf = async () => {
    setPdfLoading(true);
    try {
      const res = await fetch(`/api/v1/quotes/${id}/pdf-data`, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      const { generateQuotePdf } = await import("@/lib/pdf/generate-quote-pdf");
      generateQuotePdf(data);
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
      const res = await fetch(`/api/v1/quotes/${id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ to: sendTo, message: sendMessage }),
      });
      if (!res.ok) { toast.error("Erreur lors de l'envoi"); return; }
      toast.success("Devis envoyé par email");
      setSendOpen(false);
      qc.invalidateQueries({ queryKey: ["quote", id] });
    } catch { toast.error("Une erreur est survenue lors de l'envoi"); }
    finally { setSendLoading(false); }
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!quote) return <p>Devis introuvable.</p>;

  const clientName =
    quote.client?.companyName ??
    `${quote.client?.firstName ?? ""} ${quote.client?.lastName ?? ""}`.trim();

  const clientEmail = quote.client?.email ?? "";

  return (
    <div className="space-y-6 max-w-4xl animate-in">
      {/* Dialog envoi email */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Envoyer le devis par email</DialogTitle>
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
                placeholder={`Bonjour,\n\nVeuillez trouver ci-joint votre devis ${quote.reference}.\n\nCordialement`}
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
        title={quote.reference}
        description={clientName}
        breadcrumb={[{ label: "Devis", href: "/quotes" }, { label: quote.reference }]}
        action={
          <div className="flex gap-2 flex-wrap">
            {(quote.status === "DRAFT" || quote.status === "SENT") && (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/quotes/${id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </Button>
            )}
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
            {(quote.status === "ACCEPTED" || quote.status === "SENT") && (
              <Button onClick={handleConvert} size="sm">
                Convertir en facture
              </Button>
            )}
            {(quote.status === "DRAFT" || quote.status === "SENT") && (
              <>
                <Button onClick={() => handleAction("accept")} size="sm" variant="outline">
                  Accepter
                </Button>
                <Button onClick={() => handleAction("reject")} size="sm" variant="outline">
                  Refuser
                </Button>
              </>
            )}
            <Button onClick={() => handleAction("duplicate")} size="sm" variant="outline">
              Dupliquer
            </Button>
            <StatusBadge status={quote.status} type="quote" />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Client :</span> {clientName}</p>
            <p><span className="text-muted-foreground">Émis le :</span> {formatDateShort(quote.issueDate)}</p>
            {quote.validUntilDate && (
              <p>
                <span className="text-muted-foreground">Valide jusqu&apos;au :</span>{" "}
                {formatDateShort(quote.validUntilDate)}
              </p>
            )}
            {quote.subject && (
              <p><span className="text-muted-foreground">Objet :</span> {quote.subject}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Totaux</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total HT</span>
              <span>{formatMoney(Number(quote.subtotal))}</span>
            </div>
            {Number(quote.discountAmount) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remise</span>
                <span>- {formatMoney(Number(quote.discountAmount))}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">TVA</span>
              <span>{formatMoney(Number(quote.vatAmount))}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2 mt-2 text-base">
              <span>Total TTC</span>
              <span className="text-primary">{formatMoney(Number(quote.total))}</span>
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
              {quote.items?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{Number(item.quantity)} {item.unit ?? ""}</TableCell>
                  <TableCell>{formatMoney(Number(item.unitPrice))}</TableCell>
                  <TableCell>{Number(item.vatRate)}%</TableCell>
                  <TableCell className="text-right">{formatMoney(Number(item.subtotal))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
