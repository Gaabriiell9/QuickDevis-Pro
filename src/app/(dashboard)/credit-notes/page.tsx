"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCcw, Plus, MoreHorizontal, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils/money";
import { formatDateShort } from "@/lib/utils/dates";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Link from "next/link";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  APPLIED: "Appliqué",
  CANCELLED: "Annulé",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "secondary",
  SENT: "default",
  APPLIED: "outline",
  CANCELLED: "destructive",
};

export default function CreditNotesPage() {
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["credit-notes", page],
    queryFn: async () => {
      const res = await fetch(`/api/v1/credit-notes?page=${page}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch credit notes");
      return res.json();
    },
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/v1/credit-notes/${deleteTarget.id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      toast.success("Supprimé avec succès");
      await queryClient.invalidateQueries({ queryKey: ["credit-notes"] });
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
            <AlertDialogTitle>Supprimer cet avoir ?</AlertDialogTitle>
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
        title="Avoirs"
        description="Gestion des notes de crédit et avoirs"
        action={
          <Button asChild size="sm">
            <Link href="/credit-notes/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel avoir
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} className="h-14" />))}</div>
      ) : !data?.data?.length ? (
        <EmptyState
          icon={RefreshCcw}
          title="Aucun avoir"
          description="Les avoirs émis depuis vos factures apparaîtront ici."
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Objet</TableHead>
                <TableHead>Total TTC</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((cn: any) => {
                const clientName =
                  cn.client?.companyName ??
                  `${cn.client?.firstName ?? ""} ${cn.client?.lastName ?? ""}`.trim();
                return (
                  <TableRow key={cn.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      <Link href={`/credit-notes/${cn.id}`} className="hover:underline">{cn.reference}</Link>
                    </TableCell>
                    <TableCell>{clientName}</TableCell>
                    <TableCell className="text-muted-foreground">{cn.subject ?? "—"}</TableCell>
                    <TableCell className="font-medium">{formatMoney(Number(cn.total))}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[cn.status] as any}>{STATUS_LABELS[cn.status] ?? cn.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDateShort(cn.issueDate)}</TableCell>
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
                            onClick={() => setDeleteTarget({ id: cn.id, label: cn.reference })}
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
              <p className="text-sm text-muted-foreground">{data.total} avoirs au total</p>
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
