"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout, Plus, MoreHorizontal, Trash2, Copy, Pencil, Star } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const TYPE_LABELS: Record<string, string> = { QUOTE: "Devis", INVOICE: "Facture", CREDIT_NOTE: "Avoir" };
const STYLE_LABELS: Record<string, string> = { CLASSIC: "Classique", MODERN: "Moderne", MINIMAL: "Minimaliste", BOLD: "Bold" };

function TemplateMiniPreview({ config }: { config: any }) {
  const primary = config?.primaryColor ?? "#4338CA";
  const secondary = config?.secondaryColor ?? "#0F172A";
  const style = config?.style ?? "CLASSIC";

  return (
    <div className="bg-slate-100 rounded-lg p-3 flex items-center justify-center h-28">
      <div className="bg-white shadow-md relative overflow-hidden rounded-sm" style={{ width: "80px", height: "113px" }}>
        {(style === "CLASSIC" || style === "MODERN") && (
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", backgroundColor: primary }} />
        )}
        {style === "BOLD" ? (
          <div style={{ backgroundColor: secondary, height: "28px" }} />
        ) : style === "MINIMAL" ? (
          <div style={{ padding: "6px 6px 0 8px" }}>
            <div style={{ height: "1px", backgroundColor: primary, opacity: 0.4, marginTop: "14px" }} />
          </div>
        ) : (
          <div style={{ padding: "6px 6px 0 8px" }}>
            <div style={{ width: "28px", height: "4px", backgroundColor: secondary, borderRadius: "1px", opacity: 0.8 }} />
          </div>
        )}
        <div style={{ margin: "6px 6px 0 8px" }}>
          <div style={{ backgroundColor: secondary, height: "4px", borderRadius: "1px", marginBottom: "2px" }} />
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: "flex", gap: "2px", marginBottom: "2px" }}>
              <div style={{ flex: 3, height: "3px", backgroundColor: "#E2E8F0", borderRadius: "1px" }} />
              <div style={{ flex: 1, height: "3px", backgroundColor: i === 3 ? primary : "#E2E8F0", borderRadius: "1px", opacity: i === 3 ? 0.8 : 1 }} />
            </div>
          ))}
        </div>
        <div style={{ margin: "4px 6px 0 auto", width: "28px", marginRight: "6px" }}>
          <div style={{ backgroundColor: primary, borderRadius: "2px", height: "8px" }} />
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "6px", borderTop: "1px solid #F1F5F9", backgroundColor: "#FAFAFA" }} />
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const res = await fetch("/api/v1/templates", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/v1/templates/${deleteTarget.id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      toast.success("Template supprimé");
      await queryClient.invalidateQueries({ queryKey: ["templates"] });
    } else {
      toast.error("Erreur lors de la suppression");
    }
    setDeleteTarget(null);
  }

  async function handleDuplicate(id: string) {
    const res = await fetch(`/api/v1/templates/${id}/duplicate`, { method: "POST", credentials: "include" });
    if (res.ok) {
      toast.success("Template dupliqué");
      await queryClient.invalidateQueries({ queryKey: ["templates"] });
    } else {
      toast.error("Erreur lors de la duplication");
    }
  }

  async function handleSetDefault(id: string, type: string) {
    const res = await fetch(`/api/v1/templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isDefault: true, type }),
    });
    if (res.ok) {
      toast.success("Template défini par défaut");
      await queryClient.invalidateQueries({ queryKey: ["templates"] });
    } else {
      toast.error("Erreur");
    }
  }

  return (
    <div className="space-y-4">
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce template ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PageHeader
        title="Templates"
        description="Modèles de mise en page pour vos documents PDF"
        action={
          <Button asChild size="sm">
            <Link href="/templates/new"><Plus className="mr-2 h-4 w-4" />Nouveau template</Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
        </div>
      ) : !data?.data?.length ? (
        <EmptyState icon={Layout} title="Aucun template" description="Créez des modèles personnalisés pour vos devis et factures." action={<Button asChild><Link href="/templates/new">Créer un template</Link></Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.data.map((t: any) => {
            const config = t.content as any;
            return (
              <div key={t.id} className="border rounded-xl bg-white overflow-hidden hover:shadow-md transition-shadow">
                <TemplateMiniPreview config={config} />
                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{STYLE_LABELS[config?.style] ?? config?.style}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild><Link href={`/templates/${t.id}/edit`}><Pencil className="mr-2 h-4 w-4" />Modifier</Link></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(t.id)}><Copy className="mr-2 h-4 w-4" />Dupliquer</DropdownMenuItem>
                        {!t.isDefault && (
                          <DropdownMenuItem onClick={() => handleSetDefault(t.id, t.type)}><Star className="mr-2 h-4 w-4" />Définir par défaut</DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteTarget({ id: t.id, name: t.name })}>
                          <Trash2 className="mr-2 h-4 w-4" />Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="outline" className="text-xs">{TYPE_LABELS[t.type] ?? t.type}</Badge>
                    {t.isDefault && <Badge variant="secondary" className="text-xs">Par défaut</Badge>}
                    {config?.primaryColor && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: config.primaryColor }} />
                        {config.primaryColor}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
