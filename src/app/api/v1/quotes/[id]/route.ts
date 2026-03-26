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

  const quote = await prisma.quote.findFirst({
    where: { id, organizationId: orgId ?? undefined, deletedAt: null },
    include: { client: true, items: { orderBy: { position: "asc" } } },
  });

  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(quote);
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

  const existing = await prisma.quote.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { items, subject, issueDate, validUntilDate, notes, termsAndConditions, clientId } = body;

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
      await tx.quote.update({
        where: { id },
        data: {
          ...(clientId ? { clientId } : {}),
          ...(subject !== undefined ? { subject } : {}),
          ...(issueDate ? { issueDate: new Date(issueDate) } : {}),
          ...(validUntilDate !== undefined
            ? { validUntilDate: validUntilDate ? new Date(validUntilDate) : null }
            : {}),
          ...(notes !== undefined ? { notes } : {}),
          ...(termsAndConditions !== undefined ? { termsAndConditions } : {}),
          subtotal,
          vatAmount,
          total,
        },
      });

      await tx.quoteItem.deleteMany({ where: { quoteId: id } });

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const s = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
        const v = s * ((Number(item.vatRate) || 0) / 100);
        await tx.quoteItem.create({
          data: {
            quoteId: id,
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
    // Metadata-only update (status changes etc.)
    const data: Record<string, unknown> = {};
    if (clientId !== undefined) data.clientId = clientId;
    if (subject !== undefined) data.subject = subject;
    if (issueDate) data.issueDate = new Date(issueDate);
    if (validUntilDate !== undefined) data.validUntilDate = validUntilDate ? new Date(validUntilDate) : null;
    if (notes !== undefined) data.notes = notes;
    if (termsAndConditions !== undefined) data.termsAndConditions = termsAndConditions;
    // Allow status-only updates (from accept/reject/send flows)
    if (body.status) data.status = body.status;
    if (body.sentAt) data.sentAt = new Date(body.sentAt);
    if (body.acceptedAt) data.acceptedAt = new Date(body.acceptedAt);
    if (body.rejectedAt) data.rejectedAt = new Date(body.rejectedAt);

    if (Object.keys(data).length > 0) {
      await prisma.quote.update({ where: { id }, data });
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

  await prisma.quote.updateMany({
    where: { id, organizationId: orgId ?? undefined },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
