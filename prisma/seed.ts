import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up
  await prisma.auditLog.deleteMany();
  await prisma.emailLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.creditNoteItem.deleteMany();
  await prisma.creditNote.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.product.deleteMany();
  await prisma.client.deleteMany();
  await prisma.documentSequence.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.template.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const hashedPassword = await bcrypt.hash("demo1234", 12);
  const user = await prisma.user.create({
    data: {
      name: "Demo Admin",
      email: "demo@quickdevis.fr",
      password: hashedPassword,
      role: "USER",
    },
  });
  console.log("✅ User created:", user.email);

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: "Demo Agency",
      slug: "demo-agency",
      email: "contact@demo-agency.fr",
      phone: "01 23 45 67 89",
      address: "12 rue de la République",
      city: "Paris",
      postalCode: "75001",
      country: "FR",
      siret: "123 456 789 00012",
      vatNumber: "FR12345678901",
      currency: "EUR",
      locale: "fr-FR",
    },
  });
  console.log("✅ Organization created:", org.name);

  // Create membership — CRITICAL: joinedAt must not be null
  await prisma.organizationMember.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      role: "OWNER",
      joinedAt: new Date(),
    },
  });
  console.log("✅ Organization member created");

  // Create templates
  await prisma.template.createMany({
    data: [
      {
        organizationId: org.id,
        name: "Classique Indigo",
        type: "QUOTE",
        isDefault: true,
        content: {
          style: "CLASSIC", primaryColor: "#4338CA", secondaryColor: "#0F172A",
          showLogo: true, showSignatureBlock: true, showBankDetails: false, showStamp: true,
          headerStyle: "SPLIT", tableStyle: "STRIPED", fontStyle: "SANS",
        },
      },
      {
        organizationId: org.id,
        name: "Moderne Slate",
        type: "INVOICE",
        isDefault: true,
        content: {
          style: "MODERN", primaryColor: "#0F172A", secondaryColor: "#334155",
          showLogo: true, showSignatureBlock: false, showBankDetails: true, showStamp: true,
          headerStyle: "SPLIT", tableStyle: "STRIPED", fontStyle: "SANS",
        },
      },
      {
        organizationId: org.id,
        name: "Minimaliste",
        type: "QUOTE",
        isDefault: false,
        content: {
          style: "MINIMAL", primaryColor: "#1E293B", secondaryColor: "#475569",
          showLogo: true, showSignatureBlock: true, showBankDetails: false, showStamp: false,
          headerStyle: "SPLIT", tableStyle: "MINIMAL", fontStyle: "SANS",
        },
      },
      {
        organizationId: org.id,
        name: "Premium Noir",
        type: "INVOICE",
        isDefault: false,
        content: {
          style: "BOLD", primaryColor: "#4338CA", secondaryColor: "#111827",
          showLogo: true, showSignatureBlock: false, showBankDetails: true, showStamp: true,
          headerStyle: "CENTERED", tableStyle: "BORDERED", fontStyle: "SANS",
        },
      },
    ],
  });
  console.log("✅ Templates created: 4");

  // Create document sequences
  await prisma.documentSequence.createMany({
    data: [
      { organizationId: org.id, type: "QUOTE", prefix: "DEV", nextNumber: 1, padding: 4 },
      { organizationId: org.id, type: "INVOICE", prefix: "FAC", nextNumber: 1, padding: 4 },
      { organizationId: org.id, type: "CREDIT_NOTE", prefix: "AVO", nextNumber: 1, padding: 4 },
    ],
  });
  console.log("✅ Document sequences created");

  // Create clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        organizationId: org.id,
        reference: "CLI-0001",
        type: "COMPANY",
        companyName: "Acme Corp",
        email: "contact@acme.fr",
        phone: "01 00 11 22 33",
        address: "1 rue des Entrepreneurs",
        city: "Lyon",
        postalCode: "69001",
        country: "FR",
        vatNumber: "FR98765432100",
      },
    }),
    prisma.client.create({
      data: {
        organizationId: org.id,
        reference: "CLI-0002",
        type: "INDIVIDUAL",
        firstName: "Marie",
        lastName: "Dupont",
        email: "marie.dupont@exemple.fr",
        phone: "06 12 34 56 78",
        address: "5 avenue des Fleurs",
        city: "Marseille",
        postalCode: "13001",
        country: "FR",
      },
    }),
    prisma.client.create({
      data: {
        organizationId: org.id,
        reference: "CLI-0003",
        type: "COMPANY",
        companyName: "Startup XYZ",
        email: "hello@startup-xyz.io",
        phone: "09 87 65 43 21",
        city: "Bordeaux",
        postalCode: "33000",
        country: "FR",
      },
    }),
    prisma.client.create({
      data: {
        organizationId: org.id,
        reference: "CLI-0004",
        type: "INDIVIDUAL",
        firstName: "Jean-Paul",
        lastName: "Martin",
        email: "jp.martin@mail.fr",
        phone: "07 11 22 33 44",
        city: "Toulouse",
        postalCode: "31000",
        country: "FR",
      },
    }),
    prisma.client.create({
      data: {
        organizationId: org.id,
        reference: "CLI-0005",
        type: "COMPANY",
        companyName: "PME Solutions",
        email: "info@pme-solutions.fr",
        address: "88 boulevard Haussmann",
        city: "Paris",
        postalCode: "75008",
        country: "FR",
        siret: "987 654 321 00034",
        vatNumber: "FR09876543210",
      },
    }),
  ]);
  console.log("✅ Clients created:", clients.length);

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        organizationId: org.id,
        reference: "CONS-001",
        name: "Consultation horaire",
        description: "Prestation de conseil, tarif horaire",
        unit: "h",
        unitPrice: 150.00,
        vatRate: 20,
        category: "Services",
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        organizationId: org.id,
        reference: "DEV-001",
        name: "Développement web",
        description: "Développement d'applications web sur mesure",
        unit: "j",
        unitPrice: 800.00,
        vatRate: 20,
        category: "Développement",
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        organizationId: org.id,
        reference: "FORM-001",
        name: "Formation",
        description: "Session de formation professionnelle",
        unit: "j",
        unitPrice: 1200.00,
        vatRate: 20,
        category: "Formation",
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        organizationId: org.id,
        reference: "MAINT-001",
        name: "Maintenance mensuelle",
        description: "Contrat de maintenance et support",
        unit: "mois",
        unitPrice: 500.00,
        vatRate: 20,
        category: "Maintenance",
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        organizationId: org.id,
        reference: "AUDIT-001",
        name: "Audit technique",
        description: "Audit et analyse du système existant",
        unit: "u",
        unitPrice: 2500.00,
        vatRate: 20,
        category: "Services",
        isActive: true,
      },
    }),
  ]);
  console.log("✅ Products created:", products.length);

  // Helper to get next sequence number
  async function nextRef(type: "QUOTE" | "INVOICE" | "CREDIT_NOTE") {
    const seq = await prisma.documentSequence.update({
      where: { organizationId_type: { organizationId: org.id, type } },
      data: { nextNumber: { increment: 1 } },
    });
    const year = new Date().getFullYear();
    const num = String(seq.nextNumber - 1).padStart(seq.padding, "0");
    return `${seq.prefix}-${year}-${num}`;
  }

  // Create quotes
  const quote1 = await prisma.quote.create({
    data: {
      organizationId: org.id,
      clientId: clients[0].id,
      createdById: user.id,
      reference: await nextRef("QUOTE"),
      status: "DRAFT",
      subject: "Développement site e-commerce",
      issueDate: new Date("2026-03-01"),
      validUntilDate: new Date("2026-04-01"),
      subtotal: 4800.00,
      vatAmount: 960.00,
      total: 5760.00,
      discountAmount: 0,
      items: {
        create: [
          {
            position: 1,
            description: "Développement web",
            unit: "j",
            quantity: 6,
            unitPrice: 800.00,
            vatRate: 20,
            subtotal: 4800.00,
            vatAmount: 960.00,
            total: 5760.00,
          },
        ],
      },
    },
  });

  const quote2 = await prisma.quote.create({
    data: {
      organizationId: org.id,
      clientId: clients[1].id,
      createdById: user.id,
      reference: await nextRef("QUOTE"),
      status: "SENT",
      subject: "Formation React.js",
      issueDate: new Date("2026-03-05"),
      validUntilDate: new Date("2026-04-05"),
      subtotal: 2400.00,
      vatAmount: 480.00,
      total: 2880.00,
      discountAmount: 0,
      sentAt: new Date("2026-03-05"),
      items: {
        create: [
          {
            position: 1,
            description: "Formation React.js (2 jours)",
            unit: "j",
            quantity: 2,
            unitPrice: 1200.00,
            vatRate: 20,
            subtotal: 2400.00,
            vatAmount: 480.00,
            total: 2880.00,
          },
        ],
      },
    },
  });

  const quote3 = await prisma.quote.create({
    data: {
      organizationId: org.id,
      clientId: clients[2].id,
      createdById: user.id,
      reference: await nextRef("QUOTE"),
      status: "ACCEPTED",
      subject: "Audit technique infrastructure",
      issueDate: new Date("2026-02-15"),
      validUntilDate: new Date("2026-03-15"),
      subtotal: 2500.00,
      vatAmount: 500.00,
      total: 3000.00,
      discountAmount: 0,
      sentAt: new Date("2026-02-15"),
      acceptedAt: new Date("2026-02-20"),
      items: {
        create: [
          {
            position: 1,
            description: "Audit technique",
            unit: "u",
            quantity: 1,
            unitPrice: 2500.00,
            vatRate: 20,
            subtotal: 2500.00,
            vatAmount: 500.00,
            total: 3000.00,
          },
        ],
      },
    },
  });

  const quote4 = await prisma.quote.create({
    data: {
      organizationId: org.id,
      clientId: clients[3].id,
      createdById: user.id,
      reference: await nextRef("QUOTE"),
      status: "REJECTED",
      subject: "Développement application mobile",
      issueDate: new Date("2026-02-01"),
      validUntilDate: new Date("2026-03-01"),
      subtotal: 12000.00,
      vatAmount: 2400.00,
      total: 14400.00,
      discountAmount: 0,
      sentAt: new Date("2026-02-01"),
      rejectedAt: new Date("2026-02-10"),
      items: {
        create: [
          {
            position: 1,
            description: "Développement application mobile iOS/Android",
            unit: "j",
            quantity: 15,
            unitPrice: 800.00,
            vatRate: 20,
            subtotal: 12000.00,
            vatAmount: 2400.00,
            total: 14400.00,
          },
        ],
      },
    },
  });

  const quote5 = await prisma.quote.create({
    data: {
      organizationId: org.id,
      clientId: clients[4].id,
      createdById: user.id,
      reference: await nextRef("QUOTE"),
      status: "SENT",
      subject: "Contrat maintenance 12 mois",
      issueDate: new Date("2026-03-10"),
      validUntilDate: new Date("2026-04-10"),
      subtotal: 6000.00,
      vatAmount: 1200.00,
      total: 7200.00,
      discountAmount: 0,
      sentAt: new Date("2026-03-10"),
      items: {
        create: [
          {
            position: 1,
            description: "Maintenance mensuelle (12 mois)",
            unit: "mois",
            quantity: 12,
            unitPrice: 500.00,
            vatRate: 20,
            subtotal: 6000.00,
            vatAmount: 1200.00,
            total: 7200.00,
          },
        ],
      },
    },
  });

  console.log("✅ Quotes created: 5");

  // Create invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      organizationId: org.id,
      clientId: clients[0].id,
      createdById: user.id,
      reference: await nextRef("INVOICE"),
      status: "PAID",
      subject: "Consultation stratégie digitale",
      issueDate: new Date("2026-01-15"),
      dueDate: new Date("2026-02-14"),
      subtotal: 1500.00,
      vatAmount: 300.00,
      total: 1800.00,
      amountPaid: 1800.00,
      amountDue: 0,
      discountAmount: 0,
      sentAt: new Date("2026-01-15"),
      paidAt: new Date("2026-01-20"),
      items: {
        create: [
          {
            position: 1,
            description: "Consultation stratégie (10h)",
            unit: "h",
            quantity: 10,
            unitPrice: 150.00,
            vatRate: 20,
            subtotal: 1500.00,
            vatAmount: 300.00,
            total: 1800.00,
          },
        ],
      },
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      organizationId: org.id,
      clientId: clients[2].id,
      createdById: user.id,
      reference: await nextRef("INVOICE"),
      status: "PAID",
      subject: "Audit technique",
      issueDate: new Date("2026-02-20"),
      dueDate: new Date("2026-03-20"),
      subtotal: 2500.00,
      vatAmount: 500.00,
      total: 3000.00,
      amountPaid: 3000.00,
      amountDue: 0,
      discountAmount: 0,
      sentAt: new Date("2026-02-20"),
      paidAt: new Date("2026-03-01"),
      items: {
        create: [
          {
            position: 1,
            description: "Audit technique infrastructure",
            unit: "u",
            quantity: 1,
            unitPrice: 2500.00,
            vatRate: 20,
            subtotal: 2500.00,
            vatAmount: 500.00,
            total: 3000.00,
          },
        ],
      },
    },
  });

  const invoice3 = await prisma.invoice.create({
    data: {
      organizationId: org.id,
      clientId: clients[4].id,
      createdById: user.id,
      reference: await nextRef("INVOICE"),
      status: "SENT",
      subject: "Développement module CRM",
      issueDate: new Date("2026-03-01"),
      dueDate: new Date("2026-03-31"),
      subtotal: 4000.00,
      vatAmount: 800.00,
      total: 4800.00,
      amountPaid: 0,
      amountDue: 4800.00,
      discountAmount: 0,
      sentAt: new Date("2026-03-01"),
      items: {
        create: [
          {
            position: 1,
            description: "Développement module CRM (5 jours)",
            unit: "j",
            quantity: 5,
            unitPrice: 800.00,
            vatRate: 20,
            subtotal: 4000.00,
            vatAmount: 800.00,
            total: 4800.00,
          },
        ],
      },
    },
  });

  const invoice4 = await prisma.invoice.create({
    data: {
      organizationId: org.id,
      clientId: clients[1].id,
      createdById: user.id,
      reference: await nextRef("INVOICE"),
      status: "PARTIALLY_PAID",
      subject: "Développement site vitrine",
      issueDate: new Date("2026-02-10"),
      dueDate: new Date("2026-03-10"),
      subtotal: 3200.00,
      vatAmount: 640.00,
      total: 3840.00,
      amountPaid: 1920.00,
      amountDue: 1920.00,
      discountAmount: 0,
      sentAt: new Date("2026-02-10"),
      items: {
        create: [
          {
            position: 1,
            description: "Développement site vitrine (4 jours)",
            unit: "j",
            quantity: 4,
            unitPrice: 800.00,
            vatRate: 20,
            subtotal: 3200.00,
            vatAmount: 640.00,
            total: 3840.00,
          },
        ],
      },
    },
  });

  const invoice5 = await prisma.invoice.create({
    data: {
      organizationId: org.id,
      clientId: clients[3].id,
      createdById: user.id,
      reference: await nextRef("INVOICE"),
      status: "OVERDUE",
      subject: "Formation Next.js",
      issueDate: new Date("2026-01-20"),
      dueDate: new Date("2026-02-19"),
      subtotal: 1200.00,
      vatAmount: 240.00,
      total: 1440.00,
      amountPaid: 0,
      amountDue: 1440.00,
      discountAmount: 0,
      sentAt: new Date("2026-01-20"),
      items: {
        create: [
          {
            position: 1,
            description: "Formation Next.js (1 jour)",
            unit: "j",
            quantity: 1,
            unitPrice: 1200.00,
            vatRate: 20,
            subtotal: 1200.00,
            vatAmount: 240.00,
            total: 1440.00,
          },
        ],
      },
    },
  });

  console.log("✅ Invoices created: 5");

  // Create payments for PAID and PARTIALLY_PAID invoices
  await prisma.payment.create({
    data: {
      organizationId: org.id,
      invoiceId: invoice1.id,
      createdById: user.id,
      amount: 1800.00,
      date: new Date("2026-01-20"),
      method: "BANK_TRANSFER",
      reference: "VIR-2026-001",
    },
  });

  await prisma.payment.create({
    data: {
      organizationId: org.id,
      invoiceId: invoice2.id,
      createdById: user.id,
      amount: 3000.00,
      date: new Date("2026-03-01"),
      method: "BANK_TRANSFER",
      reference: "VIR-2026-002",
    },
  });

  await prisma.payment.create({
    data: {
      organizationId: org.id,
      invoiceId: invoice4.id,
      createdById: user.id,
      amount: 1920.00,
      date: new Date("2026-02-20"),
      method: "CARD",
      notes: "Acompte 50%",
    },
  });

  console.log("✅ Payments created");
  console.log("\n🎉 Seed completed successfully!");
  console.log("📧 Login: demo@quickdevis.fr");
  console.log("🔑 Password: demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
