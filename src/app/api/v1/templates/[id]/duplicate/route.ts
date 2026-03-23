import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db/prisma";

async function getOrgId(userId: string): Promise<string | null> {
  const m = await prisma.organizationMember.findFirst({ where: { userId, joinedAt: { not: null } }, select: { organizationId: true } });
  return m?.organizationId ?? null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const orgId = await getOrgId(token.id as string);
  const source = await prisma.template.findFirst({ where: { id, organizationId: orgId ?? undefined, deletedAt: null } });
  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const copy = await prisma.template.create({
    data: { organizationId: orgId!, name: `Copie de ${source.name}`, type: source.type, isDefault: false, content: source.content as any },
  });
  return NextResponse.json(copy, { status: 201 });
}
