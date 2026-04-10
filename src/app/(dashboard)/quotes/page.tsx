"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, Trash2, Eye, Pencil, Copy, Download } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuotes } from "@/hooks/use-quotes";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function QuotesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuotes({ search, status, page });
  const { data: usage } = usePlanUsage();
  const { hasAccess } = usePlan();
  const totalPages = data?.total ? Math.ceil(data.total / 20) : 1;

  function handleExportCsv() {
    const rows = (data?.data ?? []).map((q: any) => {
      const client = q.client?.companyName ?? `${q.client?.firstName ?? ""} ${q.client?.lastName ?? ""}`.trim();
      const totalHT = (Number(q.subtotal ?? 0)).toFixed(2);
      const tva = (Number(q.taxAmount ?? 0)).toFixed(2);
      const ttc = (Number(q.total ?? 0)).toFixed(2);
      return [q.reference, client, q.subject ?? "", totalHT, tva, ttc, q.status, q.createdAt ? new Date(q.createdAt).toLocaleDateString("fr-FR") : ""];
    });
    exportToCsv(`devis-${new Date().toISOString().slice(0, 10)}.csv`, ["Référence", "Client", "Objet", "Montant HT", "TVA", "Total TTC", "Statut", "Date"], rows);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/v1/quotes/${deleteTarget.id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      toast.success("Devis supprimé");
      await queryClient.invalidateQueries({ queryKey: ["quotes"] });
    } else {
      toast.error("Impossible de supprimer ce devis");
    }
    setDeleteTarget(null);
  }

  async function handleDuplicate(id: string, reference: string) {
    setDuplicatingId(id);
    try {
      const res = await fetch(`/api/v1/quotes/${id}/duplicate`, { method: "POST", credentials: "include" });
      if (res.ok) {
        toast.success(`Devis ${reference} dupliqué`);
        await queryClient.invalidateQueries({ queryKey: ["quotes"] });
      } else {
        toast.error("Impossible de dupliquer ce devis");
      }
    } catch {
      toast.error("Erreur serveur");
    } finally {
      setDuplicatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce devis ?</AlertDialogTitle>
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
        title="Devis"
        action={
          <div className="flex items-center gap-3">
            {usage?.limits.quotesPerMonth && (
              <PlanQuotaBadge
                used={usage.quotesThisMonth}
                limit={usage.limits.quotesPerMonth}
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
              <Link href="/quotes/new">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau devis
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
            placeholder="Rechercher un devis..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={status || "ALL"} onValueChange={(v) => { setStatus(v === "ALL" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[168px] h-9 bg-white border-slate-200 rounded-lg text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les statuts</SelectItem>
            <SelectItem value="DRAFT">Brouillon</SelectItem>
            <SelectItem value="SENT">Envoyé</SelectItem>
            <SelectItem value="ACCEPTED">Accepté</SelectItem>
            <SelectItem value="REJECTED">Refusé</SelectItem>
            <SelectItem value="EXPIRED">Expiré</SelectItem>
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
        <RichEmptyState variant="quotes" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200 hover:bg-slate-50">
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide h-10">Référence</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Client</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Objet</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total TTC</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Statut</TableHead>
                <TableHead className="text-xs font-medium text-slate-500 uppercase tracking-wide">Date</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((q: any) => (
                <TableRow key={q.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <TableCell>
                    <Link href={`/quotes/${q.id}`} className="font-mono text-sm text-indigo-600 hover:text-indigo-700 hover:underline">
                      {q.reference}
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {q.client?.companyName ?? `${q.client?.firstName ?? ""} ${q.client?.lastName ?? ""}`.trim()}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm max-w-[200px] truncate">{q.subject ?? "—"}</TableCell>
                  <TableCell className="font-semibold text-slate-900">{formatMoney(Number(q.total))}</TableCell>
                  <TableCell><StatusBadge status={q.status} type="quote" /></TableCell>
                  <TableCell className="text-slate-500 text-sm">{formatDateShort(q.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/quotes/${q.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/quotes/${q.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={duplicatingId === q.id}
                          onClick={() => handleDuplicate(q.id, q.reference)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget({ id: q.id, label: q.reference })}
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
                Page {page} sur {totalPages} · <span className="font-medium text-slate-700">{data.total}</span> devis
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
