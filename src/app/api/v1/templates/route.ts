import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db/prisma";
import { getOrgId } from "@/lib/auth/guards";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(token.id as string);
  if (!orgId) return NextResponse.json({ data: [], total: 0 });

  const { searchParams } = new URL(req.url);
  const typeFilter = searchParams.get("type");

  const data = await prisma.template.findMany({
    where: { organizationId: orgId, deletedAt: null, ...(typeFilter ? { type: typeFilter as any } : {}) },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({ data, total: data.length });
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = await getOrgId(token.id as string);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });
  try {
    const body = await req.json();
    const { name, type, isDefault, config } = body;
    if (!name || !type) return NextResponse.json({ error: "name and type required" }, { status: 400 });
    // If isDefault, unset other defaults for this type
    if (isDefault) {
      await prisma.template.updateMany({
        where: { organizationId: orgId, type, isDefault: true, deletedAt: null },
        data: { isDefault: false },
      });
    }
    const template = await prisma.template.create({
      data: { organizationId: orgId, name, type, isDefault: isDefault ?? false, content: config ?? {} },
    });
    return NextResponse.json(template, { status: 201 });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("[templates POST]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
