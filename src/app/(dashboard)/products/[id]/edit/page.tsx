"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  reference: z.string().optional(),
  description: z.string().optional(),
  unit: z.string().optional(),
  unitPrice: z.coerce.number().min(0, "Prix invalide"),
  vatRate: z.coerce.number().min(0).max(100),
  category: z.string().optional(),
  isActive: z.boolean(),
});

type ProductForm = z.infer<typeof schema>;

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: product, isLoading: isFetching } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/products/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Produit introuvable");
      return res.json();
    },
  });

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<ProductForm>({
    resolver: zodResolver(schema) as any,
    defaultValues: { vatRate: 20, unitPrice: 0, isActive: true },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        reference: product.reference ?? "",
        description: product.description ?? "",
        unit: product.unit ?? "",
        unitPrice: Number(product.unitPrice),
        vatRate: Number(product.vatRate),
        category: product.category ?? "",
        isActive: product.isActive,
      });
    }
  }, [product, reset]);

  const isActive = watch("isActive");

  const onSubmit = async (data: ProductForm) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const b = await res.json();
        toast.error(b.error ?? "Impossible de mettre à jour le produit");
        return;
      }
      toast.success("Produit mis à jour");
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["product", id] });
      router.push("/products");
    } catch {
      toast.error("Erreur serveur");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!product) return <p className="text-muted-foreground">Produit introuvable.</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Modifier le produit"
        description={product.name}
        breadcrumb={[
          { label: "Produits & Services", href: "/products" },
          { label: "Modifier" },
        ]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input {...register("name")} placeholder="Consultation horaire" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Référence</Label>
              <Input {...register("reference")} placeholder="REF-001" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...register("description")} rows={3} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Prix HT *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  onFocus={(e) => e.target.select()}
                  {...register("unitPrice")}
                />
                {errors.unitPrice && <p className="text-sm text-destructive">{errors.unitPrice.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>TVA %</Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  onFocus={(e) => e.target.select()}
                  {...register("vatRate")}
                />
              </div>
              <div className="space-y-2">
                <Label>Unité</Label>
                <Input {...register("unit")} placeholder="h, u, km..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Input {...register("category")} placeholder="Services, Matériaux..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Produit actif</p>
                <p className="text-xs text-muted-foreground">
                  Les produits inactifs n&apos;apparaissent pas dans le sélecteur lors de la création de devis
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setValue("isActive", !isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
