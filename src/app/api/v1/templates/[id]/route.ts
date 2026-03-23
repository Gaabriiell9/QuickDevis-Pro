import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db/prisma";

async function getOrgId(userId: string): Promise<string | null> {
  const m = await prisma.organizationMember.findFirst({ where: { userId, joinedAt: { not: null } }, select: { organizationId: true } });
  return m?.organizationId ?? null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const orgId = await getOrgId(token.id as string);
  const template = await prisma.template.findFirst({ where: { id, organizationId: orgId ?? undefined, deletedAt: null } });
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(template);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const orgId = await getOrgId(token.id as string);
  try {
    const body = await req.json();
    const { name, type, isDefault, config } = body;
    if (isDefault && type) {
      await prisma.template.updateMany({
        where: { organizationId: orgId ?? undefined, type, isDefault: true, deletedAt: null, NOT: { id } },
        data: { isDefault: false },
      });
    }
    const template = await prisma.template.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(isDefault !== undefined && { isDefault }),
        ...(config !== undefined && { content: config }),
      },
    });
    return NextResponse.json(template);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const orgId = await getOrgId(token.id as string);
  await prisma.template.updateMany({ where: { id, organizationId: orgId ?? undefined }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
