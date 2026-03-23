
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  emailVerified: 'emailVerified',
  image: 'image',
  password: 'password',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.OrganizationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  logo: 'logo',
  address: 'address',
  city: 'city',
  postalCode: 'postalCode',
  country: 'country',
  phone: 'phone',
  email: 'email',
  website: 'website',
  siret: 'siret',
  vatNumber: 'vatNumber',
  iban: 'iban',
  bic: 'bic',
  currency: 'currency',
  locale: 'locale',
  timezone: 'timezone',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.OrganizationMemberScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  userId: 'userId',
  role: 'role',
  invitedById: 'invitedById',
  invitedAt: 'invitedAt',
  joinedAt: 'joinedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ClientScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  reference: 'reference',
  type: 'type',
  firstName: 'firstName',
  lastName: 'lastName',
  companyName: 'companyName',
  email: 'email',
  phone: 'phone',
  address: 'address',
  city: 'city',
  postalCode: 'postalCode',
  country: 'country',
  vatNumber: 'vatNumber',
  siret: 'siret',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  reference: 'reference',
  name: 'name',
  description: 'description',
  unit: 'unit',
  unitPrice: 'unitPrice',
  vatRate: 'vatRate',
  category: 'category',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.QuoteScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  clientId: 'clientId',
  createdById: 'createdById',
  templateId: 'templateId',
  reference: 'reference',
  status: 'status',
  subject: 'subject',
  issueDate: 'issueDate',
  validUntilDate: 'validUntilDate',
  notes: 'notes',
  termsAndConditions: 'termsAndConditions',
  subtotal: 'subtotal',
  discountAmount: 'discountAmount',
  vatAmount: 'vatAmount',
  total: 'total',
  discount: 'discount',
  discountType: 'discountType',
  sentAt: 'sentAt',
  acceptedAt: 'acceptedAt',
  rejectedAt: 'rejectedAt',
  expiredAt: 'expiredAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.QuoteItemScalarFieldEnum = {
  id: 'id',
  quoteId: 'quoteId',
  productId: 'productId',
  position: 'position',
  description: 'description',
  unit: 'unit',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  vatRate: 'vatRate',
  discount: 'discount',
  discountType: 'discountType',
  subtotal: 'subtotal',
  vatAmount: 'vatAmount',
  total: 'total',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InvoiceScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  clientId: 'clientId',
  quoteId: 'quoteId',
  createdById: 'createdById',
  templateId: 'templateId',
  reference: 'reference',
  status: 'status',
  subject: 'subject',
  issueDate: 'issueDate',
  dueDate: 'dueDate',
  notes: 'notes',
  termsAndConditions: 'termsAndConditions',
  subtotal: 'subtotal',
  discountAmount: 'discountAmount',
  vatAmount: 'vatAmount',
  total: 'total',
  amountPaid: 'amountPaid',
  amountDue: 'amountDue',
  discount: 'discount',
  discountType: 'discountType',
  sentAt: 'sentAt',
  paidAt: 'paidAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.InvoiceItemScalarFieldEnum = {
  id: 'id',
  invoiceId: 'invoiceId',
  productId: 'productId',
  position: 'position',
  description: 'description',
  unit: 'unit',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  vatRate: 'vatRate',
  discount: 'discount',
  discountType: 'discountType',
  subtotal: 'subtotal',
  vatAmount: 'vatAmount',
  total: 'total',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  invoiceId: 'invoiceId',
  createdById: 'createdById',
  amount: 'amount',
  date: 'date',
  method: 'method',
  reference: 'reference',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.CreditNoteScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  clientId: 'clientId',
  invoiceId: 'invoiceId',
  createdById: 'createdById',
  templateId: 'templateId',
  reference: 'reference',
  status: 'status',
  subject: 'subject',
  issueDate: 'issueDate',
  notes: 'notes',
  subtotal: 'subtotal',
  discountAmount: 'discountAmount',
  vatAmount: 'vatAmount',
  total: 'total',
  sentAt: 'sentAt',
  appliedAt: 'appliedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.CreditNoteItemScalarFieldEnum = {
  id: 'id',
  creditNoteId: 'creditNoteId',
  productId: 'productId',
  position: 'position',
  description: 'description',
  unit: 'unit',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  vatRate: 'vatRate',
  discount: 'discount',
  discountType: 'discountType',
  subtotal: 'subtotal',
  vatAmount: 'vatAmount',
  total: 'total',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TemplateScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  type: 'type',
  isDefault: 'isDefault',
  content: 'content',
  previewUrl: 'previewUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.DocumentSequenceScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  type: 'type',
  prefix: 'prefix',
  nextNumber: 'nextNumber',
  padding: 'padding',
  yearReset: 'yearReset',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SettingScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  key: 'key',
  value: 'value',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AttachmentScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  createdById: 'createdById',
  entityType: 'entityType',
  entityId: 'entityId',
  filename: 'filename',
  originalName: 'originalName',
  mimeType: 'mimeType',
  size: 'size',
  url: 'url',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.EmailLogScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  entityType: 'entityType',
  entityId: 'entityId',
  recipientEmail: 'recipientEmail',
  subject: 'subject',
  status: 'status',
  messageId: 'messageId',
  errorMessage: 'errorMessage',
  sentAt: 'sentAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  userId: 'userId',
  action: 'action',
  entityType: 'entityType',
  entityId: 'entityId',
  oldData: 'oldData',
  newData: 'newData',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserRole = exports.$Enums.UserRole = {
  USER: 'USER',
  SUPER_ADMIN: 'SUPER_ADMIN'
};

exports.OrgMemberRole = exports.$Enums.OrgMemberRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER'
};

exports.ClientType = exports.$Enums.ClientType = {
  INDIVIDUAL: 'INDIVIDUAL',
  COMPANY: 'COMPANY'
};

exports.QuoteStatus = exports.$Enums.QuoteStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED'
};

exports.DiscountType = exports.$Enums.DiscountType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED: 'FIXED'
};

exports.InvoiceStatus = exports.$Enums.InvoiceStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH: 'CASH',
  CARD: 'CARD',
  CHECK: 'CHECK',
  OTHER: 'OTHER'
};

exports.CreditNoteStatus = exports.$Enums.CreditNoteStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  APPLIED: 'APPLIED',
  CANCELLED: 'CANCELLED'
};

exports.DocumentType = exports.$Enums.DocumentType = {
  QUOTE: 'QUOTE',
  INVOICE: 'INVOICE',
  CREDIT_NOTE: 'CREDIT_NOTE'
};

exports.EntityType = exports.$Enums.EntityType = {
  QUOTE: 'QUOTE',
  INVOICE: 'INVOICE',
  CREDIT_NOTE: 'CREDIT_NOTE',
  CLIENT: 'CLIENT',
  PRODUCT: 'PRODUCT'
};

exports.EmailStatus = exports.$Enums.EmailStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
  BOUNCED: 'BOUNCED'
};

exports.Prisma.ModelName = {
  Account: 'Account',
  Session: 'Session',
  VerificationToken: 'VerificationToken',
  User: 'User',
  Organization: 'Organization',
  OrganizationMember: 'OrganizationMember',
  Client: 'Client',
  Product: 'Product',
  Quote: 'Quote',
  QuoteItem: 'QuoteItem',
  Invoice: 'Invoice',
  InvoiceItem: 'InvoiceItem',
  Payment: 'Payment',
  CreditNote: 'CreditNote',
  CreditNoteItem: 'CreditNoteItem',
  Template: 'Template',
  DocumentSequence: 'DocumentSequence',
  Setting: 'Setting',
  Attachment: 'Attachment',
  EmailLog: 'EmailLog',
  AuditLog: 'AuditLog'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
