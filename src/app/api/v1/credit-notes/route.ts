import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db/prisma";
import { Decimal } from "@/generated/prisma/runtime/library";

async function getOrgId(userId: string): Promise<string | null> {
  const m = await prisma.organizationMember.findFirst({
    where: { userId, joinedAt: { not: null } },
    select: { organizationId: true },
  });
  return m?.organizationId ?? null;
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(token.id as string);
  if (!orgId) return NextResponse.json({ data: [], total: 0 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");

  const where = { organizationId: orgId, deletedAt: null };

  const [data, total] = await Promise.all([
    prisma.creditNote.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { client: true },
    }),
    prisma.creditNote.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, pageSize });
}

const itemSchema = z.object({
  description: z.string().min(1),
  unit: z.string().optional(),
  quantity: z.number(),
  unitPrice: z.number(),
  vatRate: z.number(),
});

const postSchema = z.object({
  clientId: z.string().min(1),
  invoiceId: z.string().optional(),
  subject: z.string().optional(),
  issueDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(token.id as string);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  try {
    const body = await req.json();
    const data = postSchema.parse(body);

    const creditNote = await prisma.$transaction(async (tx) => {
      const seq = await tx.documentSequence.update({
        where: { organizationId_type: { organizationId: orgId, type: "CREDIT_NOTE" } },
        data: { nextNumber: { increment: 1 } },
      });
      const year = new Date().getFullYear();
      const num = String(seq.nextNumber - 1).padStart(seq.padding, "0");
      const reference = `${seq.prefix}-${year}-${num}`;

      let subtotal = new Decimal(0);
      let vatAmount = new Decimal(0);
      let total = new Decimal(0);

      const itemsData = data.items.map((item, i) => {
        const qty = new Decimal(item.quantity);
        const price = new Decimal(item.unitPrice);
        const vatRate = new Decimal(item.vatRate).div(100);
        const itemSubtotal = qty.mul(price);
        const itemVat = itemSubtotal.mul(vatRate);
        const itemTotal = itemSubtotal.plus(itemVat);
        subtotal = subtotal.plus(itemSubtotal);
        vatAmount = vatAmount.plus(itemVat);
        total = total.plus(itemTotal);
        return {
          position: i + 1,
          description: item.description,
          unit: item.unit,
          quantity: new Decimal(item.quantity),
          unitPrice: new Decimal(item.unitPrice),
          vatRate: new Decimal(item.vatRate),
          subtotal: itemSubtotal,
          vatAmount: itemVat,
          total: itemTotal,
        };
      });

      return tx.creditNote.create({
        data: {
          organizationId: orgId,
          clientId: data.clientId,
          invoiceId: data.invoiceId,
          createdById: token.id as string,
          reference,
          subject: data.subject,
          issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
          notes: data.notes,
          subtotal,
          vatAmount,
          total,
          items: { create: itemsData },
        },
        include: { items: true, client: true },
      });
    });

    return NextResponse.json(creditNote, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
