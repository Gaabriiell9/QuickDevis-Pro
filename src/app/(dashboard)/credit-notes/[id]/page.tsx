"use client";

import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/utils/money";
import { formatDateShort } from "@/lib/utils/dates";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CreditNoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: cn, isLoading } = useQuery({
    queryKey: ["credit-note", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/credit-notes/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const handleAction = async (action: string) => {
    const res = await fetch(`/api/v1/credit-notes/${id}/${action}`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) { toast.error("Erreur"); return; }
    toast.success("Statut mis à jour");
    qc.invalidateQueries({ queryKey: ["credit-note", id] });
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!cn) return <p>Avoir introuvable.</p>;

  const clientName =
    cn.client?.companyName ??
    `${cn.client?.firstName ?? ""} ${cn.client?.lastName ?? ""}`.trim();

  return (
    <div className="space-y-6 max-w-4xl animate-in">
      <PageHeader
        title={cn.reference}
        description={clientName}
        breadcrumb={[{ label: "Avoirs", href: "/credit-notes" }, { label: cn.reference }]}
        action={
          <div className="flex gap-2 flex-wrap items-center">
            {cn.status === "DRAFT" && (
              <Button size="sm" onClick={() => handleAction("send")}>
                Marquer envoyé
              </Button>
            )}
            {cn.status === "SENT" && (
              <Button size="sm" variant="outline" onClick={() => handleAction("apply")}>
                Marquer appliqué
              </Button>
            )}
            <StatusBadge status={cn.status} type="credit-note" />
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
              {formatDateShort(cn.issueDate)}
            </p>
            {cn.subject && (
              <p><span className="text-muted-foreground">Objet :</span> {cn.subject}</p>
            )}
            {cn.invoiceId && (
              <p><span className="text-muted-foreground">Facture liée :</span> {cn.invoice?.reference ?? cn.invoiceId}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Totaux</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total HT</span>
              <span>{formatMoney(Number(cn.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TVA</span>
              <span>{formatMoney(Number(cn.vatAmount))}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2 mt-2 text-base">
              <span>Total TTC</span>
              <span className="text-primary">{formatMoney(Number(cn.total))}</span>
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
              {cn.items?.map((item: any) => (
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
    </div>
  );
}
