import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { Decimal } from "@/generated/prisma/runtime/library";
import { requireAuth, getOrgId } from "@/lib/auth/guards";
import { PLAN_LIMITS } from "@/lib/constants/plans";

const itemSchema = z.object({
  description: z.string().min(1),
  unit: z.string().optional(),
  quantity: z.number(),
  unitPrice: z.number(),
  vatRate: z.number().default(20),
  discount: z.number().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  productId: z.string().optional(),
});

const postSchema = z.object({
  clientId: z.string(),
  subject: z.string().optional(),
  issueDate: z.string().optional(),
  validUntilDate: z.string().optional(),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  discount: z.number().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  templateId: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

function calcItem(item: z.infer<typeof itemSchema>) {
  const qty = new Decimal(item.quantity);
  const price = new Decimal(item.unitPrice);
  const vat = new Decimal(item.vatRate).div(100);
  let subtotal = qty.mul(price);

  if (item.discount) {
    const disc = new Decimal(item.discount);
    if (item.discountType === "PERCENTAGE") {
      subtotal = subtotal.mul(new Decimal(1).minus(disc.div(100)));
    } else {
      subtotal = subtotal.minus(disc);
    }
  }

  const vatAmount = subtotal.mul(vat);
  const total = subtotal.plus(vatAmount);
  return { subtotal, vatAmount, total };
}

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
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {
    organizationId: orgId,
    deletedAt: null,
    ...(status && { status }),
    ...(search && {
      OR: [
        { reference: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { client: { companyName: { contains: search, mode: "insensitive" } } },
        { client: { lastName: { contains: search, mode: "insensitive" } } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { client: true },
    }),
    prisma.quote.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { token } = auth;

  const orgId = await getOrgId(token.id as string);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  // Limite plan FREE : 5 devis par mois
  const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { plan: true } });
  if (org?.plan === "FREE") {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const count = await prisma.quote.count({
      where: { organizationId: orgId, deletedAt: null, createdAt: { gte: startOfMonth } },
    });
    if (count >= PLAN_LIMITS.FREE.quotes) {
      return NextResponse.json(
        { error: "Limite atteinte", message: "Vous avez atteint la limite de 5 devis par mois sur le plan Gratuit. Passez au plan Pro pour des devis illimités." },
        { status: 403 }
      );
    }
  }

  try {
    const body = await req.json();
    const data = postSchema.parse(body);

    const quote = await prisma.$transaction(async (tx) => {
      const seq = await tx.documentSequence.update({
        where: { organizationId_type: { organizationId: orgId, type: "QUOTE" } },
        data: { nextNumber: { increment: 1 } },
      });
      const year = new Date().getFullYear();
      const num = String(seq.nextNumber - 1).padStart(seq.padding, "0");
      const reference = `${seq.prefix}-${year}-${num}`;

      let subtotal = new Decimal(0);
      let vatAmount = new Decimal(0);
      let total = new Decimal(0);

      const itemsData = data.items.map((item, i) => {
        const calc = calcItem(item);
        subtotal = subtotal.plus(calc.subtotal);
        vatAmount = vatAmount.plus(calc.vatAmount);
        total = total.plus(calc.total);
        return {
          position: i + 1,
          description: item.description,
          unit: item.unit,
          quantity: new Decimal(item.quantity),
          unitPrice: new Decimal(item.unitPrice),
          vatRate: new Decimal(item.vatRate),
          discount: item.discount ? new Decimal(item.discount) : null,
          discountType: item.discountType,
          subtotal: calc.subtotal,
          vatAmount: calc.vatAmount,
          total: calc.total,
          productId: item.productId,
        };
      });

      let discountAmount = new Decimal(0);
      if (data.discount) {
        if (data.discountType === "PERCENTAGE") {
          discountAmount = subtotal.mul(new Decimal(data.discount).div(100));
        } else {
          discountAmount = new Decimal(data.discount);
        }
        subtotal = subtotal.minus(discountAmount);
        total = subtotal.plus(vatAmount);
      }

      return tx.quote.create({
        data: {
          organizationId: orgId,
          clientId: data.clientId,
          createdById: token.id as string,
          reference,
          subject: data.subject,
          issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
          validUntilDate: data.validUntilDate ? new Date(data.validUntilDate) : null,
          notes: data.notes,
          termsAndConditions: data.termsAndConditions,
          templateId: data.templateId || null,
          subtotal,
          discountAmount,
          vatAmount,
          total,
          discount: data.discount ? new Decimal(data.discount) : null,
          discountType: data.discountType,
          items: { create: itemsData },
        },
        include: { items: true, client: true },
      });
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    if (process.env.NODE_ENV !== "production") console.error("[quotes POST]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
