import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { Decimal } from "@/generated/prisma/runtime/library";

const schema = z.object({
  amount: z.number().positive(),
  date: z.string(),
  method: z.enum(["BANK_TRANSFER", "CASH", "CARD", "CHECK", "OTHER"]).default("BANK_TRANSFER"),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

async function getOrgId(userId: string) {
  const m = await prisma.organizationMember.findFirst({
    where: { userId, joinedAt: { not: null } },
    select: { organizationId: true },
  });
  return m?.organizationId ?? null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const orgId = await getOrgId(token.id as string);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const invoice = await prisma.invoice.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
    });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const amountDecimal = new Decimal(data.amount);
    if (amountDecimal.greaterThan(invoice.amountDue)) {
      return NextResponse.json(
        { error: "Le montant dépasse le solde restant" },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          organizationId: orgId,
          invoiceId: id,
          createdById: token.id as string,
          amount: amountDecimal,
          date: new Date(data.date),
          method: data.method,
          reference: data.reference,
          notes: data.notes,
        },
      });

      const payments = await tx.payment.aggregate({
        where: { invoiceId: id, deletedAt: null },
        _sum: { amount: true },
      });

      const amountPaid = payments._sum.amount ?? new Decimal(0);
      const amountDue = new Decimal(invoice.total.toString()).minus(amountPaid);
      const isPaid = amountDue.lessThanOrEqualTo(0);

      return tx.invoice.update({
        where: { id },
        data: {
          amountPaid,
          amountDue: isPaid ? new Decimal(0) : amountDue,
          status: isPaid ? "PAID" : "PARTIALLY_PAID",
          paidAt: isPaid ? new Date() : null,
        },
        include: { payments: true },
      });
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
