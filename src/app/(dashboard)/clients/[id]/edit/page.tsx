"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

const schema = z.object({
  type: z.enum(["INDIVIDUAL", "COMPANY"]),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  vatNumber: z.string().optional(),
  siret: z.string().optional(),
  notes: z.string().optional(),
});

type ClientForm = z.infer<typeof schema>;

export default function EditClientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: client } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/clients/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const { register, handleSubmit, watch, setValue, reset } = useForm<ClientForm>({
    resolver: zodResolver(schema),
    defaultValues: { type: "INDIVIDUAL" },
  });

  useEffect(() => {
    if (client) reset(client);
  }, [client, reset]);

  const type = watch("type");

  const onSubmit = async (data: ClientForm) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Client mis à jour");
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      await queryClient.invalidateQueries({ queryKey: ["client", id] });
      router.push(`/clients/${id}`);
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Modifier le client" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Identité</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button type="button" variant={type === "INDIVIDUAL" ? "default" : "outline"} onClick={() => setValue("type", "INDIVIDUAL")}>Particulier</Button>
              <Button type="button" variant={type === "COMPANY" ? "default" : "outline"} onClick={() => setValue("type", "COMPANY")}>Société</Button>
            </div>
            {type === "INDIVIDUAL" ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Prénom</Label><Input {...register("firstName")} /></div>
                <div className="space-y-2"><Label>Nom</Label><Input {...register("lastName")} /></div>
              </div>
            ) : (
              <div className="space-y-2"><Label>Nom de la société</Label><Input {...register("companyName")} /></div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Email</Label><Input type="email" {...register("email")} /></div>
            <div className="space-y-2"><Label>Téléphone</Label><Input {...register("phone")} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Adresse</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Adresse</Label><Input {...register("address")} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Code postal</Label><Input {...register("postalCode")} /></div>
              <div className="space-y-2"><Label>Ville</Label><Input {...register("city")} /></div>
            </div>
            <div className="space-y-2"><Label>Pays</Label><Input {...register("country")} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea {...register("notes")} rows={3} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
        </div>
      </form>
    </div>
  );
}
