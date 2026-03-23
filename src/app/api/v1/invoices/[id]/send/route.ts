import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth, getOrgId } from "@/lib/auth/guards";
import { sendInvoiceEmail } from "@/lib/email/mailer";
import { InvoiceStatus } from "@/generated/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const { token } = auth;
  const { id } = await params;

  const orgId = await getOrgId(token.id as string);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await req.json();
  const { to, message } = body ?? {};

  if (!to) return NextResponse.json({ error: "Destinataire requis" }, { status: 400 });

  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    include: { organization: true },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const defaultMessage = `Bonjour,\n\nVeuillez trouver ci-joint votre facture ${invoice.reference}.\n\nCordialement,\n${invoice.organization.name}`;

  await sendInvoiceEmail(to, invoice.reference, invoice.organization.name, message ?? defaultMessage);

  if (invoice.status === InvoiceStatus.DRAFT) {
    await prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.SENT },
    });
  }

  try {
    await prisma.emailLog.create({
      data: {
        organizationId: orgId,
        entityType: "INVOICE",
        entityId: id,
        recipientEmail: to,
        subject: `Facture ${invoice.reference}`,
        status: "SENT",
        sentAt: new Date(),
      },
    });
  } catch {
    // Non bloquant
  }

  return NextResponse.json({ success: true });
}
