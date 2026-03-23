import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth, getOrgId } from "@/lib/auth/guards";
import { sendQuoteEmail } from "@/lib/email/mailer";
import { QuoteStatus } from "@/generated/prisma";

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

  const quote = await prisma.quote.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    include: { organization: true },
  });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const defaultMessage = `Bonjour,\n\nVeuillez trouver ci-joint votre devis ${quote.reference}.\n\nN'hésitez pas à nous contacter pour toute question.\n\nCordialement,\n${quote.organization.name}`;

  await sendQuoteEmail(to, quote.reference, quote.organization.name, message ?? defaultMessage);

  await prisma.quote.update({
    where: { id },
    data: { status: QuoteStatus.SENT, sentAt: new Date() },
  });

  try {
    await prisma.emailLog.create({
      data: {
        organizationId: orgId,
        entityType: "QUOTE",
        entityId: id,
        recipientEmail: to,
        subject: `Devis ${quote.reference}`,
        status: "SENT",
        sentAt: new Date(),
      },
    });
  } catch {
    // Non bloquant
  }

  return NextResponse.json({ success: true });
}
