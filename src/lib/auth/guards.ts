import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db/prisma";

export async function requireAuth(req: NextRequest) {
  const secureCookie = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie,
  });

  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true as const, token };
}

export async function getOrgId(userId: string): Promise<string | null> {
  const m = await prisma.organizationMember.findFirst({
    where: { userId, joinedAt: { not: null } },
    select: { organizationId: true },
  });
  return m?.organizationId ?? null;
}

export async function requireOrgMember(
  req: NextRequest,
  orgId: string,
  roles?: string[]
) {
  const authResult = await requireAuth(req);
  if (!authResult.ok) return authResult;

  const { token } = authResult;

  if (token.role === "SUPER_ADMIN") {
    return { ok: true as const, token };
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId: token.id as string,
      },
    },
  });

  if (!membership) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  if (roles && !roles.includes(membership.role)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true as const, token, membership };
}

export async function requireOrgAdmin(req: NextRequest, orgId: string) {
  return requireOrgMember(req, orgId, ["OWNER", "ADMIN"]);
}
