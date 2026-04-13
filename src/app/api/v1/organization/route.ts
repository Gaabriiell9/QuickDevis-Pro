import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/guards";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function getUniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let i = 1;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

const postSchema = z.object({
  name: z.string().min(2),
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  siret: z.string().optional(),
  vatNumber: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  currency: z.string().optional(),
  locale: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { token } = auth;

  try {
    const body = await req.json();
    const data = postSchema.parse(body);
    const slug = await getUniqueSlug(data.name);

    const org = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: data.name,
          slug,
          email: data.email,
          phone: data.phone,
          website: data.website,
          siret: data.siret,
          vatNumber: data.vatNumber,
          address: data.address,
          postalCode: data.postalCode,
          city: data.city,
          country: data.country ?? "FR",
          currency: data.currency ?? "EUR",
          locale: data.locale ?? "fr-FR",
        },
      });

      await tx.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: token.id as string,
          role: "OWNER",
          joinedAt: new Date(),
        },
      });

      await tx.documentSequence.createMany({
        data: [
          { organizationId: organization.id, type: "QUOTE", prefix: "DEV" },
          { organizationId: organization.id, type: "INVOICE", prefix: "FAC" },
          { organizationId: organization.id, type: "CREDIT_NOTE", prefix: "AVO" },
        ],
      });

      return organization;
    });

    return NextResponse.json(org, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { token } = auth;

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: token.id as string, joinedAt: { not: null } },
    include: { organization: true },
  });

  if (!membership) return NextResponse.json(null);
  return NextResponse.json(membership.organization);
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { token } = auth;

  try {
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: token.id as string, joinedAt: { not: null } },
    });
    if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const updated = await prisma.organization.update({
      where: { id: membership.organizationId },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("[organization PATCH]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
