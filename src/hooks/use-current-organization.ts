import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export function useCurrentOrganization() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["organization"],
    queryFn: async () => {
      const res = await fetch("/api/v1/organization", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch organization");
      return res.json();
    },
    enabled: !!session?.user?.organizationId,
  });
}
