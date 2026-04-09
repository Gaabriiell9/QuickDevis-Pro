import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuth, getOrgId } from "@/lib/auth/guards";
import { PLAN_LIMITS } from "@/lib/constants/plans";

const postSchema = z.object({
  type: z.enum(["INDIVIDUAL", "COMPANY"]).default("INDIVIDUAL"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  vatNumber: z.string().optional(),
  siret: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { token } = auth;

  const orgId = await getOrgId(token.id as string);
  if (!orgId) return NextResponse.json({ data: [], total: 0 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");
  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type");

  const where = {
    organizationId: orgId,
    deletedAt: null,
    ...(type && { type: type as "INDIVIDUAL" | "COMPANY" }),
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" as const } },
        { lastName: { contains: search, mode: "insensitive" as const } },
        { companyName: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { token } = auth;

  const orgId = await getOrgId(token.id as string);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  // Limite plan FREE : 2 clients maximum
  const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { plan: true } });
  if (org?.plan === "FREE") {
    const clientCount = await prisma.client.count({ where: { organizationId: orgId, deletedAt: null } });
    if (clientCount >= PLAN_LIMITS.FREE.clients) {
      return NextResponse.json(
        { error: "Limite atteinte", message: "Vous avez atteint la limite de 2 clients sur le plan Gratuit. Passez au plan Pro pour des clients illimités." },
        { status: 403 }
      );
    }
  }

  try {
    const body = await req.json();
    const data = postSchema.parse(body);

    const count = await prisma.client.count({ where: { organizationId: orgId } });
    const reference = `CLI-${String(count + 1).padStart(4, "0")}`;

    const client = await prisma.client.create({
      data: { ...data, organizationId: orgId, reference },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
