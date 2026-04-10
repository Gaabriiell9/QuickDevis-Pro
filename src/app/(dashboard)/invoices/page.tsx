"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, Trash2, Download } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useInvoices } from "@/hooks/use-invoices";
import { usePlanUsage } from "@/hooks/use-plan-usage";
import { usePlan } from "@/hooks/use-plan";
import { PlanQuotaBadge } from "@/components/shared/plan-quota-badge";
import { PageHeader } from "@/components/shared/page-header";
import { exportToCsv } from "@/lib/utils/export-csv";
import { RichEmptyState } from "@/components/shared/rich-empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatMoney } from "@/lib/utils/money";
import { formatDateShort } from "@/lib/utils/dates";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const { hasAccess } = usePlan();
  const totalPages = data?.total ? Math.ceil(data.total / 20) : 1;

  function handleExportCsv() {
    const rows = (data?.data ?? []).map((inv: any) => {
      const client = inv.client?.companyName ?? `${inv.client?.firstName ?? ""} ${inv.client?.lastName ?? ""}`.trim();
      return [
        inv.reference,
        client,
        Number(inv.total ?? 0).toFixed(2),
        Number(inv.amountPaid ?? 0).toFixed(2),
        Number(inv.amountDue ?? 0).toFixed(2),
        inv.status,
        inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("fr-FR") : "",
      ];
    });
    exportToCsv(`factures-${new Date().toISOString().slice(0, 10)}.csv`, ["Référence", "Client", "Total TTC", "Payé", "Reste dû", "Statut", "Échéance"], rows);
  }

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
    <div className="space-y-6">
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
            {hasAccess("PRO") && data?.data?.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleExportCsv}>
                <Download className="mr-2 h-4 w-4" />
                Exporter CSV
              </Button>
            )}
            <Button asChild>
              <Link href="/invoices/new">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle facture
              </Link>
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9 bg-white border-slate-200 rounded-lg h-9 text-sm"
            placeholder="Rechercher une facture..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={status || "ALL"} onValueChange={(v) => { setStatus(v === "ALL" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200 rounded-lg text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les statuts</SelectItem>
            <SelectItem value="DRAFT">Brouillon</SelectItem>
            <SelectItem value="SENT">Envoyée</SelectItem>
            <SelectItem value="PAID">Payée</SelectItem>
            <SelectItem value="PARTIALLY_PAID">Partiellement payée</SelectItem>
            <SelectItem value="OVERDUE">En retard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        </div>
      ) : !data?.data?.length ? (
        <RichEmptyState variant="invoices" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200 hover:bg-slate-50">
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide h-10">Référence</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Client</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total TTC</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Payé</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Reste dû</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Statut</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Échéance</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((inv: any) => (
                <TableRow key={inv.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <TableCell>
                    <Link href={`/invoices/${inv.id}`} className="font-mono text-sm text-indigo-600 hover:text-indigo-700 hover:underline">
                      {inv.reference}
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {inv.client?.companyName ?? `${inv.client?.firstName ?? ""} ${inv.client?.lastName ?? ""}`.trim()}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">{formatMoney(Number(inv.total))}</TableCell>
                  <TableCell className="text-slate-600">{formatMoney(Number(inv.amountPaid))}</TableCell>
                  <TableCell className="text-slate-600">{formatMoney(Number(inv.amountDue))}</TableCell>
                  <TableCell><StatusBadge status={inv.status} type="invoice" /></TableCell>
                  <TableCell className="text-slate-500 text-sm">{inv.dueDate ? formatDateShort(inv.dueDate) : "—"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Page {page} sur {totalPages} · <span className="font-medium text-slate-700">{data.total}</span> factures
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Précédent</Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" disabled={page * 20 >= data.total} onClick={() => setPage(p => p + 1)}>Suivant</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
