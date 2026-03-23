"use client";

import { useQuery } from "@tanstack/react-query";
import { Users2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
  const { data, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const res = await fetch("/api/v1/team", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch team");
      return res.json();
    },
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Équipe"
        description="Membres ayant accès à votre organisation"
      />

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
    </div>
  );
}
