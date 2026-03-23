"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  reference: z.string().optional(),
  description: z.string().optional(),
  unit: z.string().optional(),
  unitPrice: z.coerce.number().min(0),
  vatRate: z.coerce.number(),
  category: z.string().optional(),
  isActive: z.boolean(),
});

type ProductForm = z.infer<typeof schema>;

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(schema) as any,
    defaultValues: { vatRate: 20, unitPrice: 0, isActive: true },
  });

  const onSubmit = async (data: ProductForm) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/products", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) });
      if (!res.ok) { const b = await res.json(); toast.error(b.error ?? "Erreur"); return; }
      toast.success("Produit créé");
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/products");
    } catch { toast.error("Erreur serveur"); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Nouveau produit / service" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Nom *</Label><Input {...register("name")} placeholder="Consultation horaire" />{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-2"><Label>Référence</Label><Input {...register("reference")} placeholder="REF-001" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea {...register("description")} rows={3} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Prix HT *</Label><Input type="number" step="1" min="0" onFocus={(e) => e.target.select()} {...register("unitPrice")} /></div>
              <div className="space-y-2"><Label>TVA %</Label><Input type="number" step="1" min="0" max="100" onFocus={(e) => e.target.select()} {...register("vatRate")} /></div>
              <div className="space-y-2"><Label>Unité</Label><Input {...register("unit")} placeholder="h, u, km..." /></div>
            </div>
            <div className="space-y-2"><Label>Catégorie</Label><Input {...register("category")} placeholder="Services, Matériaux..." /></div>
          </CardContent>
        </Card>
        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
        </div>
      </form>
    </div>
  );
}
