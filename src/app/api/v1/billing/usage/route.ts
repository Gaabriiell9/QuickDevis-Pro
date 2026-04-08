import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth, getOrgId } from "@/lib/auth/guards";

const FREE_LIMITS = {
  quotesPerMonth: 5,
  invoicesPerMonth: 5,
  clientsTotal: 2,
};

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
    limits: plan === "FREE" ? FREE_LIMITS : { quotesPerMonth: null, invoicesPerMonth: null, clientsTotal: null },
  });
}
