"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useInvoices } from "@/hooks/use-invoices";
import { usePlanUsage } from "@/hooks/use-plan-usage";
import { PlanQuotaBadge } from "@/components/shared/plan-quota-badge";
import { PageHeader } from "@/components/shared/page-header";
import { RichEmptyState } from "@/components/shared/rich-empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatMoney } from "@/lib/utils/money";
import { formatDateShort } from "@/lib/utils/dates";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading } = useInvoices({ search, status, page });
  const { data: usage } = usePlanUsage();

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/v1/invoices/${deleteTarget.id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      toast.success("Supprimée avec succès");
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
            <AlertDialogTitle>Supprimer cette facture ?</AlertDialogTitle>
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

      <PageHeader
        title="Factures"
        action={
          <div className="flex items-center gap-3">
            {usage?.limits.invoicesPerMonth && (
              <PlanQuotaBadge
                used={usage.invoicesThisMonth}
                limit={usage.limits.invoicesPerMonth}
                label="ce mois"
              />
            )}
            <Button asChild><Link href="/invoices/new"><Plus className="mr-2 h-4 w-4" />Nouvelle facture</Link></Button>
          </div>
        }
      />

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Tous les statuts</option>
          <option value="DRAFT">Brouillon</option>
          <option value="SENT">Envoyé</option>
          <option value="PAID">Payée</option>
          <option value="PARTIALLY_PAID">Partiellement payée</option>
          <option value="OVERDUE">En retard</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} className="h-14" />))}</div>
      ) : !data?.data?.length ? (
        <RichEmptyState variant="invoices" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Total TTC</TableHead>
                <TableHead>Payé</TableHead>
                <TableHead>Reste dû</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((inv: any) => (
                <TableRow key={inv.id}>
                  <TableCell><Link href={`/invoices/${inv.id}`} className="font-mono text-sm hover:underline">{inv.reference}</Link></TableCell>
                  <TableCell>{inv.client?.companyName ?? `${inv.client?.firstName ?? ""} ${inv.client?.lastName ?? ""}`.trim()}</TableCell>
                  <TableCell className="font-medium">{formatMoney(Number(inv.total))}</TableCell>
                  <TableCell>{formatMoney(Number(inv.amountPaid))}</TableCell>
                  <TableCell>{formatMoney(Number(inv.amountDue))}</TableCell>
                  <TableCell><StatusBadge status={inv.status} type="invoice" /></TableCell>
                  <TableCell>{inv.dueDate ? formatDateShort(inv.dueDate) : "—"}</TableCell>
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
                          onClick={() => setDeleteTarget({ id: inv.id, label: inv.reference })}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data.total > 20 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{data.total} factures au total</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Précédent</Button>
                <Button variant="outline" size="sm" disabled={page * 20 >= data.total} onClick={() => setPage(p => p + 1)}>Suivant</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
