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

  const quote = await prisma.quote.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    include: {
      organization: true,
      client: true,
      items: { orderBy: { position: "asc" } },
      template: true,
    },
  });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let templateConfig = quote.template?.content ?? null;
  if (!templateConfig) {
    const defaultTmpl = await prisma.template.findFirst({
      where: { organizationId: orgId, type: "QUOTE", isDefault: true, deletedAt: null },
      select: { content: true },
    });
    templateConfig = defaultTmpl?.content ?? null;
  }

  const clientName =
    quote.client.type === "COMPANY"
      ? (quote.client.companyName ?? "")
      : `${quote.client.firstName ?? ""} ${quote.client.lastName ?? ""}`.trim();

  return NextResponse.json({
    reference: quote.reference,
    issueDate: quote.issueDate.toISOString(),
    validUntilDate: quote.validUntilDate?.toISOString() ?? null,
    subject: quote.subject,
    status: quote.status,
    subtotal: Number(quote.subtotal),
    discountAmount: Number(quote.discountAmount),
    vatAmount: Number(quote.vatAmount),
    total: Number(quote.total),
    notes: quote.notes,
    termsAndConditions: quote.termsAndConditions,
    organization: {
      name: quote.organization.name,
      address: quote.organization.address,
      postalCode: quote.organization.postalCode,
      city: quote.organization.city,
      country: quote.organization.country,
      phone: quote.organization.phone,
      email: quote.organization.email,
      siret: quote.organization.siret,
      vatNumber: quote.organization.vatNumber,
      logo: quote.organization.logo ?? null,
      iban: quote.organization.iban ?? null,
      bic: quote.organization.bic ?? null,
    },
    client: {
      type: quote.client.type,
      displayName: clientName,
      address: quote.client.address,
      postalCode: quote.client.postalCode,
      city: quote.client.city,
      country: quote.client.country,
      email: quote.client.email,
      phone: quote.client.phone,
      siret: quote.client.siret,
      vatNumber: quote.client.vatNumber,
    },
    items: quote.items.map((item) => ({
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
