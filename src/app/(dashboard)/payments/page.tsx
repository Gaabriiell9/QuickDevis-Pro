"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, MoreHorizontal, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/utils/money";
import { formatDateShort } from "@/lib/utils/dates";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants/payment-methods";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Link from "next/link";
import { toast } from "sonner";

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["payments", page],
    queryFn: async () => {
      const res = await fetch(`/api/v1/payments?page=${page}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch payments");
      return res.json();
    },
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/v1/payments/${deleteTarget.id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      toast.success("Supprimé avec succès");
      await queryClient.invalidateQueries({ queryKey: ["payments"] });
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    } else {
      toast.error("Erreur lors de la suppression");
    }
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-4">
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce paiement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le document sera archivé définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PageHeader title="Paiements" description="Historique de tous les paiements reçus" />

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-14" />))}</div>
      ) : !data?.data?.length ? (
        <EmptyState
          icon={CreditCard}
          title="Aucun paiement"
          description="Les paiements enregistrés sur vos factures apparaîtront ici."
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Facture</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((payment: any) => {
                const clientName =
                  payment.invoice?.client?.companyName ??
                  `${payment.invoice?.client?.firstName ?? ""} ${payment.invoice?.client?.lastName ?? ""}`.trim();
                return (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDateShort(payment.date)}</TableCell>
                    <TableCell>
                      <Link href={`/invoices/${payment.invoice?.id}`} className="font-mono text-sm hover:underline text-primary">
                        {payment.invoice?.reference}
                      </Link>
                    </TableCell>
                    <TableCell>{clientName}</TableCell>
                    <TableCell>{PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{payment.reference ?? "—"}</TableCell>
                    <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                      {formatMoney(Number(payment.amount))}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget({ id: payment.id, label: payment.reference ?? payment.id })}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {data.total > 20 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{data.total} paiements au total</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Précédent</Button>
                <Button variant="outline" size="sm" disabled={page * 20 >= data.total} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
