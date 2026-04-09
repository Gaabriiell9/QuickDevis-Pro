import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db/prisma";

async function getOrgId(userId: string): Promise<string | null> {
  const m = await prisma.organizationMember.findFirst({
    where: { userId, joinedAt: { not: null } },
    select: { organizationId: true },
  });
  return m?.organizationId ?? null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const orgId = await getOrgId(token.id as string);

  // Auto-update OVERDUE status if SENT and past due date
  await prisma.invoice.updateMany({
    where: { id, organizationId: orgId ?? undefined, deletedAt: null, status: "SENT", dueDate: { lt: new Date() } },
    data: { status: "OVERDUE" },
  });

  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId: orgId ?? undefined, deletedAt: null },
    include: {
      client: true,
      items: { orderBy: { position: "asc" } },
      payments: { where: { deletedAt: null }, orderBy: { date: "desc" } },
    },
  });

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const orgId = await getOrgId(token.id as string);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const existing = await prisma.invoice.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    select: { status: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.status === "PAID") {
    return NextResponse.json({ error: "Impossible de modifier une facture payée" }, { status: 400 });
  }

  const body = await req.json();
  const { items, subject, issueDate, dueDate, notes, termsAndConditions, clientId } = body;

  if (items && Array.isArray(items)) {
    // Full edit: replace items + recalculate totals
    let subtotal = 0;
    let vatAmount = 0;
    for (const item of items) {
      const s = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      subtotal += s;
      vatAmount += s * ((Number(item.vatRate) || 0) / 100);
    }
    const total = subtotal + vatAmount;

    await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id },
        data: {
          ...(clientId ? { clientId } : {}),
          ...(subject !== undefined ? { subject } : {}),
          ...(issueDate ? { issueDate: new Date(issueDate) } : {}),
          ...(dueDate !== undefined
            ? { dueDate: dueDate ? new Date(dueDate) : null }
            : {}),
          ...(notes !== undefined ? { notes } : {}),
          ...(termsAndConditions !== undefined ? { termsAndConditions } : {}),
          subtotal,
          vatAmount,
          total,
          amountDue: total,
        },
      });

      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const s = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
        const v = s * ((Number(item.vatRate) || 0) / 100);
        await tx.invoiceItem.create({
          data: {
            invoiceId: id,
            position: i,
            description: item.description ?? "",
            unit: item.unit || null,
            quantity: Number(item.quantity) || 0,
            unitPrice: Number(item.unitPrice) || 0,
            vatRate: Number(item.vatRate) || 0,
            subtotal: s,
            vatAmount: v,
            total: s + v,
          },
        });
      }
    });
  } else {
    // Metadata-only update
    const data: Record<string, unknown> = {};
    if (clientId !== undefined) data.clientId = clientId;
    if (subject !== undefined) data.subject = subject;
    if (issueDate) data.issueDate = new Date(issueDate);
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (notes !== undefined) data.notes = notes;
    if (termsAndConditions !== undefined) data.termsAndConditions = termsAndConditions;
    if (body.status) data.status = body.status;
    if (body.sentAt) data.sentAt = new Date(body.sentAt);
    if (body.paidAt) data.paidAt = new Date(body.paidAt);

    if (Object.keys(data).length > 0) {
      await prisma.invoice.update({ where: { id }, data });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const orgId = await getOrgId(token.id as string);

  await prisma.invoice.updateMany({
    where: { id, organizationId: orgId ?? undefined },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
