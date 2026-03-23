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

  const client = await prisma.client.findFirst({
    where: { id, organizationId: orgId ?? undefined, deletedAt: null },
    include: {
      quotes: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 5 },
      invoices: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(client);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const orgId = await getOrgId(token.id as string);
  const body = await req.json();

  const client = await prisma.client.updateMany({
    where: { id, organizationId: orgId ?? undefined },
    data: body,
  });

  if (!client.count) return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  await prisma.client.updateMany({
    where: { id, organizationId: orgId ?? undefined },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
