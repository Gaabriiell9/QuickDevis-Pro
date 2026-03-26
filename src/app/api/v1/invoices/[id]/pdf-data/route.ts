import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth, getOrgId } from "@/lib/auth/guards";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAuth(req);
  if (!guard.ok) return guard.response;
  const { token } = guard;

  const { id } = await params;
  const orgId = await getOrgId(token.id as string);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    include: {
      organization: true,
      client: true,
      items: { orderBy: { position: "asc" } },
      quote: { select: { reference: true } },
    },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let templateConfig = null;
  if ((invoice as any).templateId) {
    const tmpl = await prisma.template.findUnique({ where: { id: (invoice as any).templateId }, select: { content: true } });
    templateConfig = tmpl?.content ?? null;
  } else {
    const defaultTmpl = await prisma.template.findFirst({
      where: { organizationId: orgId, type: "INVOICE", isDefault: true, deletedAt: null },
      select: { content: true },
    });
    templateConfig = defaultTmpl?.content ?? null;
  }

  const clientName =
    invoice.client.type === "COMPANY"
      ? (invoice.client.companyName ?? "")
      : `${invoice.client.firstName ?? ""} ${invoice.client.lastName ?? ""}`.trim();

  return NextResponse.json({
    reference: invoice.reference,
    issueDate: invoice.issueDate.toISOString(),
    validUntilDate: null,
    dueDate: invoice.dueDate?.toISOString() ?? null,
    subject: invoice.subject,
    status: invoice.status,
    subtotal: Number(invoice.subtotal),
    discountAmount: Number(invoice.discountAmount),
    vatAmount: Number(invoice.vatAmount),
    total: Number(invoice.total),
    amountPaid: Number(invoice.amountPaid),
    amountDue: Number(invoice.amountDue),
    quoteReference: invoice.quote?.reference ?? null,
    notes: invoice.notes,
    termsAndConditions: invoice.termsAndConditions,
    organization: {
      name: invoice.organization.name,
      address: invoice.organization.address,
      postalCode: invoice.organization.postalCode,
      city: invoice.organization.city,
      country: invoice.organization.country,
      phone: invoice.organization.phone,
      email: invoice.organization.email,
      siret: invoice.organization.siret,
      vatNumber: invoice.organization.vatNumber,
      logo: (invoice.organization as any).logo ?? null,
      iban: (invoice.organization as any).iban ?? null,
      bic: (invoice.organization as any).bic ?? null,
    },
    client: {
      type: invoice.client.type,
      displayName: clientName,
      address: invoice.client.address,
      postalCode: invoice.client.postalCode,
      city: invoice.client.city,
      country: invoice.client.country,
      email: invoice.client.email,
      phone: invoice.client.phone,
      siret: invoice.client.siret,
      vatNumber: invoice.client.vatNumber,
    },
    items: invoice.items.map((item) => ({
      position: item.position,
      description: item.description,
      unit: item.unit,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      vatRate: Number(item.vatRate),
      subtotal: Number(item.subtotal),
      vatAmount: Number(item.vatAmount),
      total: Number(item.total),
    })),
    templateConfig,
  });
}
