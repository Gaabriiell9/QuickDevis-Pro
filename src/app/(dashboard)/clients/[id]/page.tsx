"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/utils/money";
import { formatDateShort } from "@/lib/utils/dates";
import { Edit } from "lucide-react";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: client, isLoading } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/clients/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!client) return <p>Client introuvable.</p>;

  const name =
    client.type === "COMPANY"
      ? client.companyName
      : `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim();

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title={name}
        description={client.reference}
        action={
          <Button asChild variant="outline">
            <Link href={`/clients/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Coordonnées</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {client.email && <p><span className="text-muted-foreground">Email:</span> {client.email}</p>}
            {client.phone && <p><span className="text-muted-foreground">Tél:</span> {client.phone}</p>}
            {client.address && <p><span className="text-muted-foreground">Adresse:</span> {client.address}, {client.postalCode} {client.city}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Informations légales</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {client.siret && <p><span className="text-muted-foreground">SIRET:</span> {client.siret}</p>}
            {client.vatNumber && <p><span className="text-muted-foreground">TVA:</span> {client.vatNumber}</p>}
          </CardContent>
        </Card>
      </div>

      {client.quotes?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Devis récents</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {client.quotes.map((q: any) => (
              <div key={q.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <Link href={`/quotes/${q.id}`} className="font-mono text-sm hover:underline">{q.reference}</Link>
                <div className="flex items-center gap-3">
                  <StatusBadge status={q.status} type="quote" />
                  <span className="text-sm">{formatMoney(Number(q.total))}</span>
                  <span className="text-xs text-muted-foreground">{formatDateShort(q.createdAt)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {client.invoices?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Factures récentes</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {client.invoices.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <Link href={`/invoices/${inv.id}`} className="font-mono text-sm hover:underline">{inv.reference}</Link>
                <div className="flex items-center gap-3">
                  <StatusBadge status={inv.status} type="invoice" />
                  <span className="text-sm">{formatMoney(Number(inv.total))}</span>
                  <span className="text-xs text-muted-foreground">{formatDateShort(inv.createdAt)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
