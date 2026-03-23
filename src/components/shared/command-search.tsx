"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Receipt, Users, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { formatMoney } from "@/lib/utils/money";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  label: string;
  sub?: string;
  href: string;
  type: "client" | "quote" | "invoice";
}

interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(q)}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();

      const all: SearchResult[] = [
        ...data.clients.map((c: any) => ({
          id: c.id,
          type: "client" as const,
          label: c.type === "COMPANY"
            ? c.companyName
            : `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim(),
          sub: c.email,
          href: `/clients/${c.id}`,
        })),
        ...data.quotes.map((q: any) => ({
          id: q.id,
          type: "quote" as const,
          label: q.reference,
          sub: q.subject ?? formatMoney(Number(q.total)),
          href: `/quotes/${q.id}`,
        })),
        ...data.invoices.map((inv: any) => ({
          id: inv.id,
          type: "invoice" as const,
          label: inv.reference,
          sub: inv.subject ?? formatMoney(Number(inv.total)),
          href: `/invoices/${inv.id}`,
        })),
      ];
      setResults(all);
      setActive(0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  const navigate = (href: string) => {
    router.push(href);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      navigate(results[active].href);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  const typeIcon = (type: SearchResult["type"]) => {
    if (type === "client") return <Users className="size-4 text-blue-500" />;
    if (type === "quote") return <FileText className="size-4 text-indigo-500" />;
    return <Receipt className="size-4 text-emerald-500" />;
  };

  const typeLabel = (type: SearchResult["type"]) => {
    if (type === "client") return "Client";
    if (type === "quote") return "Devis";
    return "Facture";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden" aria-describedby={undefined}>
        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher clients, devis, factures..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto">
          {query.length >= 2 && !loading && results.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucun résultat pour &ldquo;{query}&rdquo;
            </p>
          )}

          {results.length > 0 && (
            <ul className="py-2">
              {results.map((r, i) => (
                <li key={r.id + r.type}>
                  <button
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      i === active ? "bg-accent" : "hover:bg-muted/50"
                    )}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => navigate(r.href)}
                  >
                    <span className="shrink-0">{typeIcon(r.type)}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium truncate">{r.label}</span>
                      {r.sub && (
                        <span className="block text-xs text-muted-foreground truncate">{r.sub}</span>
                      )}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{typeLabel(r.type)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!query && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Search className="mx-auto mb-2 size-8 opacity-20" />
              Tapez pour rechercher...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span><kbd className="rounded border px-1">↑↓</kbd> naviguer</span>
          <span><kbd className="rounded border px-1">↵</kbd> ouvrir</span>
          <span><kbd className="rounded border px-1">Esc</kbd> fermer</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
