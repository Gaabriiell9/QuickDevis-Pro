"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users2, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PlanGate } from "@/components/shared/plan-gate";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateShort } from "@/lib/utils/dates";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Propriétaire",
  ADMIN: "Administrateur",
  MEMBER: "Membre",
};

const ROLE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  OWNER: "default",
  ADMIN: "secondary",
  MEMBER: "outline",
};

export default function TeamPage() {
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviteLoading, setInviteLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const res = await fetch("/api/v1/team", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch team");
      return res.json();
    },
  });

  async function handleInvite() {
    if (!inviteEmail) return;
    setInviteLoading(true);
    try {
      const res = await fetch("/api/v1/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Erreur lors de l'invitation");
        return;
      }
      if (body.invited) {
        toast.success(`Invitation envoyée à ${inviteEmail}`);
      } else {
        toast.success(`${inviteEmail} a été ajouté à l'équipe`);
        await queryClient.invalidateQueries({ queryKey: ["team-members"] });
      }
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("MEMBER");
    } catch {
      toast.error("Erreur serveur");
    } finally {
      setInviteLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inviter un membre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="collaborateur@exemple.fr"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rôle</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Membre</SelectItem>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Annuler</Button>
            <Button onClick={handleInvite} disabled={inviteLoading || !inviteEmail} className="bg-indigo-600 hover:bg-indigo-700">
              {inviteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Inviter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PageHeader
        title="Équipe"
        description="Membres ayant accès à votre organisation"
        action={
          <Button onClick={() => setInviteOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <UserPlus className="mr-2 h-4 w-4" />
            Inviter un membre
          </Button>
        }
      />

      <PlanGate plan="BUSINESS" feature="Gérez plusieurs utilisateurs au sein de votre organisation." className="min-h-[300px]">
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : !data?.length ? (
        <EmptyState
          icon={Users2}
          title="Aucun membre"
          description="Invitez des collaborateurs pour travailler ensemble."
        />
      ) : (
        <div className="space-y-3">
          {data.map((member: any) => {
            const initials = member.user?.name
              ? member.user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "?";
            return (
              <Card key={member.id}>
                <CardContent className="flex items-center gap-4 py-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.user?.image ?? ""} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{member.user?.name ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.user?.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <Badge variant={ROLE_VARIANTS[member.role] ?? "outline"}>
                      {ROLE_LABELS[member.role] ?? member.role}
                    </Badge>
                    {member.joinedAt && (
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        Depuis le {formatDateShort(member.joinedAt)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      </PlanGate>
    </div>
  );
}
