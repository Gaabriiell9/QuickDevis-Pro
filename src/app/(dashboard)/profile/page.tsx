"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

const profileSchema = z.object({ name: z.string().min(2, "Nom requis") });
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z.string().min(8, "Min. 8 caractères"),
  confirmPassword: z.string().min(1),
}).refine(d => d.newPassword === d.confirmPassword, { message: "Les mots de passe ne correspondent pas", path: ["confirmPassword"] });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const { register: regProfile, handleSubmit: handleProfile, reset } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });
  const { register: regPassword, handleSubmit: handlePassword, reset: resetPwd, formState: { errors: pwdErrors } } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => { if (session?.user) reset({ name: session.user.name ?? "" }); }, [session, reset]);

  const onProfileSubmit = async (data: ProfileForm) => {
    setProfileLoading(true);
    try {
      const res = await fetch("/api/v1/auth/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      await update({ name: data.name });
      toast.success("Profil mis à jour");
    } catch { toast.error("Erreur lors de la mise à jour"); }
    finally { setProfileLoading(false); }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/v1/auth/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }) });
      if (!res.ok) { const b = await res.json(); toast.error(b.error ?? "Erreur"); return; }
      toast.success("Mot de passe modifié");
      resetPwd();
    } catch { toast.error("Erreur"); }
    finally { setPasswordLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <PageHeader title="Mon profil" />

      <form onSubmit={handleProfile(onProfileSubmit)}>
        <Card>
          <CardHeader><CardTitle>Informations personnelles</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Nom complet</Label><Input {...regProfile("name")} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={session?.user?.email ?? ""} disabled /></div>
          </CardContent>
        </Card>
        <Button type="submit" className="mt-4" disabled={profileLoading}>{profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer</Button>
      </form>

      <form onSubmit={handlePassword(onPasswordSubmit)}>
        <Card>
          <CardHeader><CardTitle>Changer le mot de passe</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Mot de passe actuel</Label><Input type="password" {...regPassword("currentPassword")} /></div>
            <div className="space-y-2"><Label>Nouveau mot de passe</Label><Input type="password" {...regPassword("newPassword")} /></div>
            <div className="space-y-2"><Label>Confirmer</Label><Input type="password" {...regPassword("confirmPassword")} />{pwdErrors.confirmPassword && <p className="text-sm text-destructive">{pwdErrors.confirmPassword.message}</p>}</div>
          </CardContent>
        </Card>
        <Button type="submit" className="mt-4" disabled={passwordLoading}>{passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Modifier le mot de passe</Button>
      </form>
    </div>
  );
}
