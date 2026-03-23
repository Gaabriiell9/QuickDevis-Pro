import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db/prisma";

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

  const original = await prisma.invoice.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    include: { items: true },
  });
  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newInvoice = await prisma.$transaction(async (tx) => {
    const seq = await tx.documentSequence.update({
      where: { organizationId_type: { organizationId: orgId, type: "INVOICE" } },
      data: { nextNumber: { increment: 1 } },
    });
    const year = new Date().getFullYear();
    const num = String(seq.nextNumber - 1).padStart(seq.padding, "0");
    const reference = `${seq.prefix}-${year}-${num}`;

    return tx.invoice.create({
      data: {
        organizationId: orgId,
        clientId: original.clientId,
        createdById: token.id as string,
        reference,
        status: "DRAFT",
        subject: original.subject,
        notes: original.notes,
        termsAndConditions: original.termsAndConditions,
        subtotal: original.subtotal,
        discountAmount: original.discountAmount,
        vatAmount: original.vatAmount,
        total: original.total,
        amountDue: original.total,
        discount: original.discount,
        discountType: original.discountType,
        items: {
          create: original.items.map((item) => ({
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
  });

  return NextResponse.json(newInvoice, { status: 201 });
}
