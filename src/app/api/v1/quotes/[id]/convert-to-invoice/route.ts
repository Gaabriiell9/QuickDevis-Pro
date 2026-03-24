import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db/prisma";
import { INVOICE_DEFAULT_PAYMENT_DAYS } from "@/config/app";

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

  const quote = await prisma.quote.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    include: { items: true },
  });

  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!["ACCEPTED", "SENT"].includes(quote.status)) {
    return NextResponse.json(
      { error: "Le devis doit être accepté ou envoyé pour être converti" },
      { status: 400 }
    );
  }

  const invoice = await prisma.$transaction(async (tx) => {
    const seq = await tx.documentSequence.update({
      where: { organizationId_type: { organizationId: orgId, type: "INVOICE" } },
      data: { nextNumber: { increment: 1 } },
    });
    const year = new Date().getFullYear();
    const num = String(seq.nextNumber - 1).padStart(seq.padding, "0");
    const reference = `${seq.prefix}-${year}-${num}`;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + INVOICE_DEFAULT_PAYMENT_DAYS);

    const newInvoice = await tx.invoice.create({
      data: {
        organizationId: orgId,
        clientId: quote.clientId,
        quoteId: quote.id,
        createdById: token.id as string,
        reference,
        subject: quote.subject,
        templateId: quote.templateId,
        dueDate,
        notes: quote.notes,
        termsAndConditions: quote.termsAndConditions,
        subtotal: quote.subtotal,
        discountAmount: quote.discountAmount,
        vatAmount: quote.vatAmount,
        total: quote.total,
        amountDue: quote.total,
        discount: quote.discount,
        discountType: quote.discountType,
        items: {
          create: quote.items.map((item) => ({
            position: item.position,
            description: item.description,
            unit: item.unit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            vatRate: item.vatRate,
            discount: item.discount,
            discountType: item.discountType,
            subtotal: item.subtotal,
            vatAmount: item.vatAmount,
            total: item.total,
            productId: item.productId,
          })),
        },
      },
    });

    await tx.quote.update({
      where: { id: quote.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });

    return newInvoice;
  });

  return NextResponse.json(invoice, { status: 201 });
}
