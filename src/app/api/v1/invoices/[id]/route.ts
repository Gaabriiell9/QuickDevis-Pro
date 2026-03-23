import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db/prisma";

async function getOrgId(userId: string): Promise<string | null> {
  const m = await prisma.organizationMember.findFirst({
    where: { userId, joinedAt: { not: null } },
    select: { organizationId: true },
  });
  return m?.organizationId ?? null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const orgId = await getOrgId(token.id as string);

  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId: orgId ?? undefined, deletedAt: null },
    include: {
      client: true,
      items: { orderBy: { position: "asc" } },
      payments: { where: { deletedAt: null }, orderBy: { date: "desc" } },
    },
  });

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const orgId = await getOrgId(token.id as string);

  const existing = await prisma.invoice.findFirst({
    where: { id, organizationId: orgId ?? undefined },
    select: { status: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.status === "PAID") {
    return NextResponse.json({ error: "Impossible de modifier une facture payée" }, { status: 400 });
  }

  const body = await req.json();
  await prisma.invoice.updateMany({
    where: { id, organizationId: orgId ?? undefined },
    data: body,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const orgId = await getOrgId(token.id as string);

  await prisma.invoice.updateMany({
    where: { id, organizationId: orgId ?? undefined },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
