export interface TemplateConfig {
  style: "CLASSIC" | "MODERN" | "MINIMAL" | "BOLD";
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  showLogo: boolean;
  showSignatureBlock: boolean;
  showBankDetails: boolean;
  showStamp: boolean;
  headerStyle: "LEFT" | "CENTERED" | "SPLIT";
  tableStyle: "BORDERED" | "STRIPED" | "MINIMAL";
  fontStyle: "SANS" | "SERIF";
  footerText?: string;
  defaultNotes?: string;
  defaultTerms?: string;
}

export interface PdfOrganization {
  name: string;
  legalName?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  siret?: string | null;
  vatNumber?: string | null;
  logo?: string | null;
  iban?: string | null;
  bic?: string | null;
}

export interface PdfClient {
  type: string;
  displayName: string;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
  email?: string | null;
  phone?: string | null;
  siret?: string | null;
  vatNumber?: string | null;
}

export interface PdfItem {
  position: number;
  description: string;
  unit?: string | null;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  subtotal: number;
  vatAmount: number;
  total: number;
}

export interface PdfQuoteData {
  reference: string;
  issueDate: string;
  validUntilDate?: string | null;
  subject?: string | null;
  status: string;
  subtotal: number;
  discountAmount: number;
  vatAmount: number;
  total: number;
  notes?: string | null;
  termsAndConditions?: string | null;
  organization: PdfOrganization;
  client: PdfClient;
  items: PdfItem[];
  templateConfig?: TemplateConfig | null;
}

export interface PdfInvoiceData extends PdfQuoteData {
  dueDate?: string | null;
  amountPaid: number;
  amountDue: number;
  quoteReference?: string | null;
}
