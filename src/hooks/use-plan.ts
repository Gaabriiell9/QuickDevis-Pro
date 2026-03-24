import { useCurrentOrganization } from "./use-current-organization";

export type Plan = "FREE" | "PRO" | "BUSINESS";

const PLAN_RANK: Record<Plan, number> = { FREE: 0, PRO: 1, BUSINESS: 2 };

export function usePlan() {
  const { data: org, isLoading } = useCurrentOrganization();
  const plan: Plan = (org?.plan as Plan) ?? "FREE";

  return {
    plan,
    isLoading,
    // During loading, show content (avoids flash of locked state for paying users)
    hasAccess: (required: Plan) =>
      isLoading ? true : PLAN_RANK[plan] >= PLAN_RANK[required],
  };
}
