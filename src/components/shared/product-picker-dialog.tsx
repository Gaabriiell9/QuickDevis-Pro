"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatMoney } from "@/lib/utils/money";

type Product = {
  id: string;
  name: string;
  reference?: string | null;
  unitPrice: number | string;
  vatRate: number | string;
  unit?: string | null;
};

interface ProductPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: Product) => void;
}

export function ProductPickerDialog({ open, onOpenChange, onSelect }: ProductPickerDialogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/v1/products?pageSize=50", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setProducts(d.data ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Choisir un produit / service</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 -mx-1 px-1">
          {loading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Chargement...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Aucun produit dans le catalogue.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b sticky top-0 bg-background z-10">
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Nom</th>
                  <th className="py-2 pr-4 font-medium">Référence</th>
                  <th className="py-2 pr-4 font-medium text-right">Prix HT</th>
                  <th className="py-2 pr-4 font-medium text-right">TVA %</th>
                  <th className="py-2 font-medium">Unité</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => { onSelect(p); onOpenChange(false); }}
                    className="border-b last:border-0 hover:bg-muted cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 pr-4 font-medium">{p.name}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{p.reference ?? "—"}</td>
                    <td className="py-2.5 pr-4 text-right">{formatMoney(Number(p.unitPrice))}</td>
                    <td className="py-2.5 pr-4 text-right">{Number(p.vatRate)} %</td>
                    <td className="py-2.5 text-muted-foreground">{p.unit ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
