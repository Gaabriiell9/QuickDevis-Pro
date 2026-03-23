"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen, FileText, Receipt } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import Link from "next/link";

type DocType = "all" | "quote" | "invoice";

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [docType, setDocType] = useState<DocType>("all");
  const [page, setPage] = useState(1);

  const quotesQuery = useQuery({
    queryKey: ["quotes-docs", search, page],
    queryFn: async () => {
      const sp = new URLSearchParams({ page: String(page), pageSize: "10" });
      if (search) sp.set("search", search);
      const res = await fetch(`/api/v1/quotes?${sp}`, { credentials: "include" });
      if (!res.ok) throw new Error();
      return res.json();
    },
    enabled: docType === "all" || docType === "quote",
  });

  const invoicesQuery = useQuery({
    queryKey: ["invoices-docs", search, page],
    queryFn: async () => {
      const sp = new URLSearchParams({ page: String(page), pageSize: "10" });
      if (search) sp.set("search", search);
      const res = await fetch(`/api/v1/invoices?${sp}`, { credentials: "include" });
      if (!res.ok) throw new Error();
      return res.json();
    },
    enabled: docType === "all" || docType === "invoice",
  });

  const isLoading = quotesQuery.isLoading || invoicesQuery.isLoading;

  const allDocs = [
    ...(docType !== "invoice" ? (quotesQuery.data?.data ?? []).map((q: any) => ({ ...q, docType: "quote" })) : []),
    ...(docType !== "quote" ? (invoicesQuery.data?.data ?? []).map((i: any) => ({ ...i, docType: "invoice" })) : []),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4">
      <PageHeader
        title="Documents"
        description="Tous vos devis et factures en un seul endroit"
      />

      <div className="flex gap-3">
        <Input
          className="flex-1"
          placeholder="Rechercher par référence, objet, client..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <div className="flex gap-1 rounded-md border p-1">
          {(["all", "quote", "invoice"] as DocType[]).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={docType === t ? "default" : "ghost"}
              onClick={() => { setDocType(t); setPage(1); }}
              className="h-7 px-3 text-xs"
            >
              {t === "all" ? "Tous" : t === "quote" ? "Devis" : "Factures"}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : !allDocs.length ? (
        <EmptyState
          icon={FolderOpen}
          title="Aucun document"
          description="Vos devis et factures apparaîtront ici."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Référence</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Objet</TableHead>
              <TableHead>Total TTC</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allDocs.map((doc: any) => {
              const clientName =
                doc.client?.companyName ??
                `${doc.client?.firstName ?? ""} ${doc.client?.lastName ?? ""}`.trim();
              const href = doc.docType === "quote" ? `/quotes/${doc.id}` : `/invoices/${doc.id}`;
              return (
                <TableRow key={`${doc.docType}-${doc.id}`}>
                  <TableCell>
                    <Badge variant="outline" className="gap-1 text-xs">
                      {doc.docType === "quote" ? (
                        <FileText className="h-3 w-3" />
                      ) : (
                        <Receipt className="h-3 w-3" />
                      )}
                      {doc.docType === "quote" ? "Devis" : "Facture"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={href} className="font-mono text-sm hover:underline text-primary">
                      {doc.reference}
                    </Link>
                  </TableCell>
                  <TableCell>{clientName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{doc.subject ?? "—"}</TableCell>
                  <TableCell className="font-medium">{formatMoney(Number(doc.total))}</TableCell>
                  <TableCell>
                    <StatusBadge status={doc.status} type={doc.docType} />
                  </TableCell>
                  <TableCell>{formatDateShort(doc.createdAt)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
