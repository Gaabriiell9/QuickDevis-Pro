import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Decimal } from "@/generated/prisma/runtime/library";
import { requireAuth, getOrgId } from "@/lib/auth/guards";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { token } = auth;

  const orgId = await getOrgId(token.id as string);
  if (!orgId) {
    return NextResponse.json({
      caMois: 0,
      caAnnee: 0,
      totalDevis: 0,
      totalFactures: 0,
      facturesPayees: 0,
      facturesRetard: 0,
      montantEnAttente: 0,
      tauxConversion: 0,
      recentDocuments: [],
    });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [caMoisResult, caAnneeResult, totalDevis, totalFactures, facturesPayees, facturesRetard, attente, devisAcceptes, devisNonDraft, recentQuotes, recentInvoices, paidInvoices12m] = await Promise.all([
    prisma.invoice.aggregate({
      where: { organizationId: orgId, status: "PAID", paidAt: { gte: startOfMonth }, deletedAt: null },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: { organizationId: orgId, status: "PAID", paidAt: { gte: startOfYear }, deletedAt: null },
      _sum: { total: true },
    }),
    prisma.quote.count({ where: { organizationId: orgId, deletedAt: null } }),
    prisma.invoice.count({ where: { organizationId: orgId, deletedAt: null } }),
    prisma.invoice.count({ where: { organizationId: orgId, status: "PAID", deletedAt: null } }),
    prisma.invoice.count({
      where: {
        organizationId: orgId,
        status: { in: ["SENT", "PARTIALLY_PAID"] },
        dueDate: { lt: now },
        deletedAt: null,
      },
    }),
    prisma.invoice.aggregate({
      where: {
        organizationId: orgId,
        status: { in: ["SENT", "PARTIALLY_PAID"] },
        deletedAt: null,
      },
      _sum: { amountDue: true },
    }),
    prisma.quote.count({ where: { organizationId: orgId, status: "ACCEPTED", deletedAt: null } }),
    prisma.quote.count({ where: { organizationId: orgId, status: { not: "DRAFT" }, deletedAt: null } }),
    prisma.quote.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { client: true },
    }),
    prisma.invoice.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { client: true },
    }),
    prisma.invoice.findMany({
      where: {
        organizationId: orgId,
        status: "PAID",
        paidAt: { gte: twelveMonthsAgo },
        deletedAt: null,
      },
      select: { paidAt: true, total: true },
    }),
  ]);

  const tauxConversion = devisNonDraft > 0 ? Math.round((devisAcceptes / devisNonDraft) * 100) : 0;

  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const label = d.toLocaleDateString("fr-FR", { month: "short" });
    const encaisse = paidInvoices12m
      .filter((inv) => {
        if (!inv.paidAt) return false;
        const paid = new Date(inv.paidAt);
        return paid.getMonth() === d.getMonth() && paid.getFullYear() === d.getFullYear();
      })
      .reduce((sum, inv) => sum + Number(inv.total), 0);
    return { month: label, encaisse };
  });

  const recentDocuments = [
    ...recentQuotes.map((q) => ({ ...q, docType: "quote" })),
    ...recentInvoices.map((i) => ({ ...i, docType: "invoice" })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return NextResponse.json({
    caMois: Number(caMoisResult._sum.total ?? 0),
    caAnnee: Number(caAnneeResult._sum.total ?? 0),
    totalDevis,
    totalFactures,
    facturesPayees,
    facturesRetard,
    montantEnAttente: Number(attente._sum.amountDue ?? 0),
    tauxConversion,
    recentDocuments,
    monthlyRevenue,
  });
}
