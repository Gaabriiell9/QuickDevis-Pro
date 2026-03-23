import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db/prisma";
import { getOrgId } from "@/lib/auth/guards";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const orgId = await getOrgId(token.id as string);

  await prisma.payment.updateMany({
    where: { id, organizationId: orgId ?? undefined },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
