import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getOrgId } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { token } = auth;

  const orgId = await getOrgId(token.id as string);
  if (!orgId) return NextResponse.json({ clients: [], quotes: [], invoices: [] });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json({ clients: [], quotes: [], invoices: [] });
  }

  const [clients, quotes, invoices] = await Promise.all([
    prisma.client.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        OR: [
          { companyName: { contains: q, mode: "insensitive" } },
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { reference: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, companyName: true, firstName: true, lastName: true, type: true, email: true },
      take: 5,
    }),
    prisma.quote.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        OR: [
          { reference: { contains: q, mode: "insensitive" } },
          { subject: { contains: q, mode: "insensitive" } },
          { client: { companyName: { contains: q, mode: "insensitive" } } },
          { client: { lastName: { contains: q, mode: "insensitive" } } },
        ],
      },
      select: { id: true, reference: true, subject: true, status: true, total: true },
      take: 5,
    }),
    prisma.invoice.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        OR: [
          { reference: { contains: q, mode: "insensitive" } },
          { subject: { contains: q, mode: "insensitive" } },
          { client: { companyName: { contains: q, mode: "insensitive" } } },
          { client: { lastName: { contains: q, mode: "insensitive" } } },
        ],
      },
      select: { id: true, reference: true, subject: true, status: true, total: true },
      take: 5,
    }),
  ]);

  return NextResponse.json({ clients, quotes, invoices });
}
