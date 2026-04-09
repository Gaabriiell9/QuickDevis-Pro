import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth, getOrgId } from "@/lib/auth/guards";
import { PLAN_LIMITS } from "@/lib/constants/plans";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const orgId = await getOrgId(auth.token.id as string);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { plan: true } });
  const plan = org?.plan ?? "FREE";

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [quotesThisMonth, invoicesThisMonth, clientsTotal] = await Promise.all([
    prisma.quote.count({ where: { organizationId: orgId, deletedAt: null, createdAt: { gte: startOfMonth } } }),
    prisma.invoice.count({ where: { organizationId: orgId, deletedAt: null, createdAt: { gte: startOfMonth } } }),
    prisma.client.count({ where: { organizationId: orgId, deletedAt: null } }),
  ]);

  return NextResponse.json({
    plan,
    quotesThisMonth,
    invoicesThisMonth,
    clientsTotal,
    limits: plan === "FREE"
      ? { quotesPerMonth: PLAN_LIMITS.FREE.quotes, invoicesPerMonth: PLAN_LIMITS.FREE.invoices, clientsTotal: PLAN_LIMITS.FREE.clients }
      : { quotesPerMonth: null, invoicesPerMonth: null, clientsTotal: null },
  });
}
