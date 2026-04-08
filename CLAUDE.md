# QuickDevis Pro — Project Context

## What is QuickDevis Pro?

QuickDevis Pro est un SaaS de gestion de devis et factures pour les TPE/PME françaises. Il permet de créer des devis, les convertir en factures, gérer les clients, les produits, les paiements et générer des PDFs professionnels.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | **Next.js 16.1.7** (App Router, `src/` layout) + TypeScript |
| Styles | **Tailwind CSS v4** + **shadcn/ui** (Nova preset, Radix) |
| ORM | **Prisma 5.22** — client généré dans `src/generated/prisma` |
| Auth | **NextAuth v4** + `@auth/prisma-adapter` — stratégie JWT |
| State | **TanStack Query v5** + **react-hook-form** + **Zod v4** |
| PDF | **jsPDF** + **jspdf-autotable** + **@react-pdf/renderer** |
| Email | **Resend** API |
| Charts | **Recharts** |
| Animations | **Framer Motion** |
| Toasts | **Sonner** |
| Thème | **next-themes** |
| Passwords | **bcryptjs** |
| DB | **PostgreSQL** via `pg` |

---

## Architecture critique — règles impératives

### Imports
- PrismaClient → `import { ... } from "@/generated/prisma"` (JAMAIS `@prisma/client`)
- Decimal → `import { Decimal } from "@/generated/prisma/runtime/library"`
- `cn()` → `import { cn } from "@/lib/utils"`
- Chemins TypeScript → `@/*` = `./src/*`
- **Seul `src/app/` existe** — l'ancien dossier `app/` a été supprimé

### Zod v4 — règles obligatoires
- `z.email()` et NON `z.string().email()` (déprécié en v4)
- `error.issues[0]` et NON `error.errors[0]` (`errors` n'existe pas en v4)
- `z.number({ error: "..." })` et NON `invalid_type_error:`
- **Jamais** `z.nativeEnum(MonEnum)` — utiliser `z.enum(["VAL1", "VAL2"])` avec les valeurs littérales
- **Jamais** `.default()` dans un schéma Zod utilisé avec `zodResolver` — mettre les valeurs par défaut dans `defaultValues` de `useForm()`

### react-hook-form — règles obligatoires
- Champs numériques : `z.number()` dans le schéma + `{ valueAsNumber: true }` dans `register()`
- **Jamais** `z.coerce.number()` — provoque des erreurs de type avec `zodResolver`
- Si `zodResolver` pose problème malgré tout → `resolver: zodResolver(schema) as any`
- `"use client"` **obligatoire** sur tout composant utilisant hooks ou event handlers
- Next.js 15 : `params` dans les route handlers est `Promise<{ id: string }>` → toujours `await params`

### Middleware / Auth
- `/onboarding` n'est **pas** dans `AUTH_ROUTES` (les users connectés doivent y accéder)
- Redirection onboarding → `pathname.startsWith("/onboarding")`
- JWT callback → filtre `joinedAt: { not: null }` pour trouver le membership

### Seed
- `joinedAt: new Date()` est **obligatoire** sur `OrganizationMember` sinon boucle d'onboarding infinie
- Compte démo : `demo@quickdevis.fr` / `demo1234`

---

## Structure des dossiers

```
src/
├── app/
│   ├── (auth)/              # login, register, forgot-password, reset-password
│   ├── (dashboard)/         # toutes les pages authentifiées
│   │   ├── dashboard/       # KPIs + graphiques
│   │   ├── quotes/          # devis (list, new, [id], [id]/edit)
│   │   ├── invoices/        # factures (list, new, [id], [id]/edit)
│   │   ├── credit-notes/    # avoirs
│   │   ├── clients/         # clients
│   │   ├── products/        # catalogue produits
│   │   ├── templates/       # modèles de documents
│   │   ├── payments/        # paiements
│   │   ├── settings/        # paramètres (company, documents)
│   │   ├── team/            # gestion d'équipe
│   │   ├── profile/         # profil utilisateur
│   │   └── analytics/       # analytiques
│   ├── (onboarding)/        # welcome, onboarding
│   ├── (marketing)/         # page publique, CGU, mentions légales
│   └── api/
│       ├── auth/[...nextauth]/
│       └── v1/              # toutes les routes API REST
│
├── components/
│   ├── app-shell/           # AppSidebar, AppTopbar
│   ├── editor/              # document-preview.tsx (aperçu live devis/facture)
│   ├── pdf/                 # composants PDF
│   ├── shared/              # PageHeader, EmptyState, StatusBadge, MoneyDisplay,
│   │                        # ConfirmDialog, ProductPickerDialog, CommandSearch, PlanGate
│   └── ui/                  # composants shadcn/ui (button, input, card, dialog, etc.)
│
├── hooks/
│   ├── use-clients.ts       # liste clients avec pagination/search
│   ├── use-quotes.ts        # liste devis avec filtre statut
│   ├── use-invoices.ts      # liste factures avec filtre statut
│   ├── use-products.ts      # liste produits
│   ├── use-dashboard-summary.ts  # KPIs dashboard
│   ├── use-current-organization.ts
│   ├── use-plan.ts          # feature flags / plan
│   └── use-debounce.ts      # debounce pour recherche (300ms)
│
├── lib/
│   ├── auth/
│   │   ├── auth-options.ts  # configuration NextAuth
│   │   ├── guards.ts        # requireAuth(), requireOrgMember()
│   │   ├── session.ts       # getServerSession(), requireServerSession()
│   │   └── password.ts      # hash/verify avec bcryptjs
│   ├── db/
│   │   └── prisma.ts        # singleton PrismaClient
│   ├── email/
│   │   ├── mailer.ts        # orchestrateur d'envoi
│   │   └── resend.ts        # intégration Resend API
│   ├── pdf/
│   │   ├── generate-quote-pdf.ts    # génération PDF devis (jsPDF)
│   │   ├── generate-invoice-pdf.ts  # génération PDF facture (jsPDF)
│   │   ├── pdf-types.ts             # types pour les données PDF
│   │   └── pdf-formatters.ts        # formatage nombres/dates/montants
│   ├── constants/
│   │   ├── quote-status.ts    # labels et couleurs statuts devis
│   │   ├── invoice-status.ts  # labels et couleurs statuts factures
│   │   └── payment-methods.ts # labels méthodes de paiement
│   └── utils/
│       ├── cn.ts              # clsx + twMerge
│       ├── money.ts           # formatage et calculs monétaires
│       └── dates.ts           # formatage dates (locale fr-FR)
│
├── types/
│   └── next-auth.d.ts       # extension types NextAuth (id, role, organizationId)
│
├── config/
│   └── app.ts               # APP_NAME, APP_URL, délais par défaut
│
├── generated/
│   └── prisma/              # client Prisma généré (à importer ici)
│
└── middleware.ts             # routing auth/onboarding/protected

prisma/
├── schema.prisma            # schéma base de données
├── seed.ts                  # données de démo
└── migrations/              # migrations Prisma
```

---

## Modèles de données (Prisma)

### Auth & Users
- **User** — email, password (hashé), role (USER | SUPER_ADMIN), comptes OAuth, sessions
- **Account** — comptes OAuth liés à un User
- **Session** — sessions NextAuth
- **VerificationToken** — tokens de vérification email

### Organisation (multi-tenant)
- **Organization** — workspace entreprise avec slug unique, settings (logo, adresse, TVA, IBAN, BIC), currency (EUR), locale (fr-FR), timezone
- **OrganizationMember** — appartenance User→Organization avec rôle (OWNER | ADMIN | MEMBER) et `joinedAt` obligatoire

### Documents
- **Quote** — devis (DRAFT→SENT→ACCEPTED/REJECTED/EXPIRED/CANCELLED), lié à Client + User + Template optionnel, calculs TVA/remises
- **QuoteItem** — lignes de devis (lien produit optionnel, qté, prix, TVA)
- **Invoice** — factures (DRAFT→SENT→PAID/PARTIALLY_PAID/OVERDUE/CANCELLED/REFUNDED), peut être créée depuis un Quote, `amountPaid`/`amountDue`
- **InvoiceItem** — lignes de factures
- **CreditNote** — avoirs (DRAFT→SENT→APPLIED/CANCELLED), lié optionnellement à une Invoice
- **CreditNoteItem** — lignes d'avoirs
- **Payment** — paiements (BANK_TRANSFER | CASH | CARD | CHECK | OTHER), lié à une Invoice

### Catalogue
- **Product** — produits réutilisables (nom, description, prix HT, TVA 20% par défaut, catégorie, unité)

### Templates & Config
- **Template** — modèles de documents (QUOTE | INVOICE | CREDIT_NOTE), contenu JSON, flag `isDefault`
- **DocumentSequence** — numérotation auto des références (DEV-0001, FAC-0001, AVO-0001), préfixe, reset annuel, padding
- **Setting** — paires clé/valeur JSON par organisation
- **Client** — clients (INDIVIDUAL | COMPANY), contact complet, SIRET, N° TVA

### Logs & Audit
- **Attachment** — pièces jointes (QUOTE | INVOICE | CREDIT_NOTE | CLIENT | PRODUCT)
- **EmailLog** — traçabilité emails envoyés (PENDING | SENT | FAILED | BOUNCED)
- **AuditLog** — journal complet des modifications (oldData, newData, IP, user-agent)

---

## API Routes (`/api/v1/`)

| Ressource | Endpoints |
|-----------|-----------|
| **auth** | POST register, POST forgot-password, POST reset-password, GET me |
| **organization** | POST create, GET get, PATCH update |
| **clients** | GET list (search, page, type), POST, GET [id], PATCH [id], DELETE [id] |
| **products** | GET list (search, page), POST, GET [id], PATCH [id], DELETE [id] |
| **quotes** | GET list (status, page), POST, GET [id], PATCH [id], DELETE [id], POST [id]/send, POST [id]/accept, POST [id]/reject, POST [id]/convert-to-invoice, POST [id]/duplicate, GET [id]/pdf-data, GET [id]/pdf |
| **invoices** | GET list (status, page), POST, GET [id], PATCH [id], DELETE [id], POST [id]/send, POST [id]/duplicate, POST [id]/mark-paid, POST [id]/register-payment, GET [id]/pdf-data, GET [id]/pdf |
| **credit-notes** | GET list (status, page), POST, GET [id], PATCH [id], DELETE [id], POST [id]/send |
| **payments** | GET list, POST, GET [id], PATCH [id], DELETE [id] |
| **templates** | GET list (type filter), POST, GET [id], PATCH [id], DELETE [id], POST [id]/duplicate |
| **settings** | GET all, PATCH upsert |
| **dashboard** | GET summary (KPIs + chart data) |
| **team** | GET list, POST invite, PATCH [id] role, DELETE [id] |
| **search** | GET ?q= (global search clients/quotes/invoices) |

---

## Patterns importants

### Soft delete
Toutes les entités utilisent `deletedAt` (timestamp) — jamais de suppression physique.

### Multi-tenancy
Toutes les queries Prisma sont isolées par `organizationId`.

### Numérotation automatique
Utilise `DocumentSequence` pour générer des références (DEV-0001, FAC-0001, AVO-0001).

### Calculs financiers
Utilise `Decimal` de Prisma pour la précision monétaire (jamais `float`).

### Statuts documentaires
Workflows stricts : DRAFT → SENT → (état terminal). Les transitions invalides sont bloquées côté API.

### Cohérence PDF ↔ Aperçu
Le rendu `document-preview.tsx` (aperçu live) et la génération PDF (jsPDF) utilisent les mêmes données et doivent rester synchronisés visuellement.

---

## Variables d'environnement

```env
# Base de données
DATABASE_URL="postgresql://admin:password@localhost:5432/quickdevis"

# NextAuth
NEXTAUTH_SECRET="générer avec: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="QuickDevis Pro"
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH="false"
NEXT_PUBLIC_ENABLE_TEAM_FEATURE="true"
NEXT_PUBLIC_ENABLE_BILLING="false"

# Email (Resend)
RESEND_API_KEY="re_xxxx"
EMAIL_FROM="QuickDevis Pro <noreply@quickdevis.fr>"

# Google OAuth (optionnel)
# GOOGLE_CLIENT_ID="..."
# GOOGLE_CLIENT_SECRET="..."
```

---

## Commandes utiles

```bash
# Développement
npm run dev

# Prisma
npx prisma migrate dev       # nouvelle migration
npx prisma generate          # régénérer le client
npx prisma studio            # interface GUI

# Seed
npx tsx prisma/seed.ts       # injecter les données démo

# Build
npm run build
```

---

## Compte démo

- Email : `demo@quickdevis.fr`
- Mot de passe : `demo1234`
