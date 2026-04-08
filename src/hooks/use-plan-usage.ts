import { useQuery } from "@tanstack/react-query";

export interface PlanUsage {
  plan: string;
  quotesThisMonth: number;
  invoicesThisMonth: number;
  clientsTotal: number;
  limits: {
    quotesPerMonth: number | null;
    invoicesPerMonth: number | null;
    clientsTotal: number | null;
  };
}

export function usePlanUsage() {
  return useQuery<PlanUsage>({
    queryKey: ["plan-usage"],
    queryFn: async () => {
      const res = await fetch("/api/v1/billing/usage", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch usage");
      return res.json();
    },
    staleTime: 0,
  });
}
