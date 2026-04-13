"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nom requis (min. 2 caractères)"),
    email: z.email("Email invalide"),
    password: z.string().min(8, "Mot de passe (min. 8 caractères)"),
    confirmPassword: z.string().min(1, "Confirmation requise"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const inviteToken = searchParams.get("invite");
  const inviteEmail = searchParams.get("email");
  const isInvited = !!inviteToken && !!inviteEmail;
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: inviteEmail ?? "",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          ...(inviteToken ? { inviteToken } : {}),
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        toast.error(body.error ?? "Erreur lors de la création du compte");
        return;
      }

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Compte créé mais connexion échouée, veuillez vous connecter");
        router.push("/login");
        return;
      }

      if (plan) {
        sessionStorage.setItem("pendingPlan", plan);
      }

      if (isInvited) {
        router.push("/dashboard");
      } else {
        router.push("/welcome");
      }
      router.refresh();
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error("[register]", err);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>
          {isInvited
            ? "Créez votre compte pour rejoindre l'organisation"
            : "Commencez votre essai gratuit QuickDevis Pro"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {isInvited && (
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <p className="text-sm text-blue-800">
                Vous avez été invité à rejoindre une organisation. Créez votre compte pour accepter l&apos;invitation.
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input id="name" placeholder="Jean Dupont" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@exemple.fr"
              disabled={isInvited}
              readOnly={isInvited}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer mon compte
          </Button>
          {!isInvited && process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true" && (
            <>
              <div className="relative w-full flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">ou</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
              >
                <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continuer avec Google
              </Button>
            </>
          )}
          <p className="text-sm text-center text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href={plan ? `/login?plan=${plan}` : "/login"} className="underline hover:text-foreground">
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div />}>
      <RegisterForm />
    </Suspense>
  );
}
