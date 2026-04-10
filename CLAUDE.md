# QuickDevis Pro — Project Context

## What is QuickDevis Pro?

QuickDevis Pro est un SaaS de gestion de devis et factures pour les TPE/PME françaises. Il permet de créer des devis, les convertir en factures, gérer les clients, les produits, les paiements et générer des PDFs professionnels. Le projet est en production sur Vercel avec Stripe, Resend et Neon (PostgreSQL).

---

## Hébergement & déploiement

- **Production** : `https://quick-devis-pro.vercel.app` (Vercel)
- **Domaine custom** : `https://quickdevis.gf-web.fr` (configuré mais NEXTAUTH_URL pointe vers vercel)
- **Repos Git** :
  - GitHub : `https://github.com/Gaabriiell9/QuickDevis-Pro.git` (remote `github`) — connecté à Vercel pour le déploiement auto
  - Gitea : `https://git.gf-web.fr/Gabriel/QuickDevis.git` (remote `gitea`)
- **Déploiement** : push sur `main` → Vercel déploie automatiquement
- **Base de données** : Neon PostgreSQL (cloud)
- Le Dockerfile + docker-compose présents dans le repo sont pour le dev local uniquement

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | **Next.js 16.1.7** (App Router, `src/` layout) + TypeScript |
| Styles | **Tailwind CSS v4** + **shadcn/ui** (Nova preset, Radix) |
| ORM | **Prisma 5.22** — client généré dans `src/generated/prisma` |
| Auth | **NextAuth v4** + `@auth/prisma-adapter` — stratégie JWT |
| State | **TanStack Query v5** + **react-hook-form** + **Zod v4** |
| PDF | **jsPDF** + **jspdf-autotable** (génération côté client) |
| Email | **Resend** API |
| Billing | **Stripe** — checkout sessions + webhooks |
| Charts | **Recharts** |
| Animations | **Framer Motion** |
| Toasts | **Sonner** |
| Thème | **next-themes** |
| Passwords | **bcryptjs** |
| DB | **PostgreSQL 16** via Neon + `pg` |

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
- Next.js 15+ : `params` dans les route handlers est `Promise<{ id: string }>` → toujours `await params`
- `onFocus={(e) => e.target.select()}` sur tous les inputs numériques pour éviter le "01"

### PDF — règles critiques
- Génération **côté client** avec jsPDF (pas côté serveur)
- `fMoney()` doit remplacer les espaces insécables : `.replace(/\u202F/g, " ").replace(/\u00A0/g, " ")`
- Colonnes tableau : desc=80 + qty=18 + unit=18 + price=28 + vat=14 + total=20 = 178mm exactement
- `checkPageBreak()` avant chaque section pour gérer le multi-pages
- `drawSideAccent()` dans `didDrawPage` de autoTable
- `drawFooter()` dans une boucle sur toutes les pages à la fin
- Le template est chargé via `templateId` dans le devis/facture → récupéré dans `/pdf-data` route

### Middleware / Auth
- `/onboarding` n'est **pas** dans `AUTH_ROUTES` (les users connectés doivent y accéder)
- Redirection onboarding → `pathname.startsWith("/onboarding")`
- JWT callback → filtre `joinedAt: { not: null }` pour trouver le membership
- En production HTTPS : `secureCookie: true` dans `getToken()` — **critique** sinon auth cassée
- `NEXTAUTH_URL` doit correspondre exactement au domaine de production

### Seed
- `joinedAt: new Date()` est **obligatoire** sur `OrganizationMember` sinon boucle d'onboarding infinie
- Compte démo : `demo@quickdevis.fr` / `demo1234`
- L'org démo a le plan PRO activé dans le seed
- 4 templates pré-installés : Classique Indigo, Moderne Slate, Minimaliste, Premium Noir

### Fetch côté client
- Tous les fetch doivent avoir `credentials: "include"` pour envoyer les cookies de session
- Sans ça → 401 systématique même si l'user est connecté

### TanStack Query — invalidation
- Après chaque POST/PATCH/DELETE, invalider le cache :
  `await queryClient.invalidateQueries({ queryKey: ["clients"] })`
- Sans ça, les listes ne se mettent pas à jour sans reload

### Limites FREE centralisées
- `src/lib/constants/plans.ts` contient `PLAN_LIMITS` — ne jamais hardcoder les limites dans les routes
- FREE : 5 devis/mois, 5 factures/mois, 2 clients

### Suppressions protégées
- Client avec devis/factures actifs → 409 Conflict
- Template utilisé par des devis/factures → 409 Conflict
- Toutes les suppressions sont des soft-delete via `deletedAt`

---

## Structure des dossiers

```
src/
├── app/
│   ├── (auth)/              # login, register, forgot-password, reset-password, onboarding
│   ├── (dashboard)/         # toutes les pages authentifiées
│   │   ├── dashboard/       # KPIs + graphiques
│   │   ├── quotes/          # devis (list, new, [id], [id]/edit)
│   │   ├── invoices/        # factures (list, new, [id], [id]/edit, [id]/payments)
│   │   ├── credit-notes/    # avoirs (list, new, [id])
│   │   ├── clients/         # clients (list, new, [id], [id]/edit)
│   │   ├── products/        # catalogue produits (list, new, [id]/edit)
│   │   ├── templates/       # modèles de documents (list, new, [id]/edit)
│   │   ├── payments/        # paiements (list)
│   │   ├── settings/        # paramètres (company, documents, billing, regional, email)
│   │   ├── team/            # gestion d'équipe
│   │   ├── profile/         # profil utilisateur
│   │   ├── analytics/       # analytiques
│   │   └── documents/       # vue unifiée devis + factures
│   ├── (marketing)/         # landing page, CGU, mentions légales, confidentialité
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── webhooks/stripe/  # webhook Stripe
│       └── v1/              # toutes les routes API REST
│
├── components/
│   ├── app-shell/           # AppSidebar (sombre), AppTopbar
│   ├── pdf/                 # composants PDF (@react-pdf/renderer — non utilisé en prod)
│   ├── shared/              # PageHeader, EmptyState, StatusBadge, MoneyDisplay,
│   │                        # ConfirmDialog, ProductPickerDialog, CommandSearch, PlanGate,
│   │                        # TemplatePreview
│   └── ui/                  # composants shadcn/ui
│
├── hooks/
│   ├── use-clients.ts
│   ├── use-quotes.ts
│   ├── use-invoices.ts
│   ├── use-products.ts
│   ├── use-dashboard-summary.ts
│   ├── use-current-organization.ts
│   ├── use-plan.ts          # feature flags / plan Stripe
│   └── use-debounce.ts      # 300ms debounce pour recherche
│
├── lib/
│   ├── auth/
│   │   ├── auth-options.ts  # NextAuth config + secureCookie en prod
│   │   ├── guards.ts        # requireAuth(), requireOrgMember(), getOrgId()
│   │   ├── session.ts       # getServerSession()
│   │   └── password.ts      # bcryptjs hash/verify
│   ├── db/
│   │   └── prisma.ts        # singleton PrismaClient
│   ├── email/
│   │   ├── mailer.ts        # sendResetPasswordEmail, sendQuoteEmail, sendInvoiceEmail
│   │   └── resend.ts        # Resend client
│   ├── pdf/
│   │   ├── generate-quote-pdf.ts    # jsPDF — thème Abby, 4 styles
│   │   ├── generate-invoice-pdf.ts  # jsPDF — thème Abby + bloc paiement
│   │   ├── pdf-types.ts             # PdfQuoteData, PdfInvoiceData, TemplateConfig
│   │   └── pdf-formatters.ts        # fMoney (anti-espace insécable), fDate, fNumber
│   ├── constants/
│   │   ├── plans.ts           # PLAN_LIMITS centralisé
│   │   ├── quote-status.ts
│   │   ├── invoice-status.ts
│   │   └── payment-methods.ts
│   └── utils/
│       ├── cn.ts
│       ├── money.ts
│       └── dates.ts
│
├── types/
│   └── next-auth.d.ts       # id, role, organizationId, onboardingCompleted
│
├── config/
│   └── app.ts               # APP_NAME, APP_URL, INVOICE_DEFAULT_PAYMENT_DAYS=30
│
├── generated/
│   └── prisma/              # client Prisma généré
│
└── middleware.ts             # routing auth/onboarding/protected + secureCookie

prisma/
├── schema.prisma
├── seed.ts                  # demo@quickdevis.fr / demo1234 + plan PRO + 4 templates
└── migrations/
```

---

## Modèles de données (Prisma)

### Auth & Users
- **User** — email, password (bcrypt), role (USER | SUPER_ADMIN)
- **Account**, **Session**, **VerificationToken** — NextAuth

### Organisation (multi-tenant)
- **Organization** — slug unique, logo (base64 ou URL), adresse, TVA, IBAN, BIC, currency, locale, timezone, `stripeCustomerId`, `stripeSubscriptionId`, `plan` (FREE | PRO | PREMIUM)
- **OrganizationMember** — rôle (OWNER | ADMIN | MEMBER), `joinedAt` OBLIGATOIRE

### Documents
- **Quote** — DRAFT→SENT→ACCEPTED/REJECTED/EXPIRED/CANCELLED, templateId optionnel
- **QuoteItem** — lien produit optionnel, calculs Decimal
- **Invoice** — DRAFT→SENT→PAID/PARTIALLY_PAID/OVERDUE/CANCELLED/REFUNDED, peut venir d'un Quote, OVERDUE mis à jour automatiquement si dueDate < now
- **InvoiceItem**
- **CreditNote** — DRAFT→SENT→APPLIED/CANCELLED
- **CreditNoteItem**
- **Payment** — BANK_TRANSFER | CASH | CARD | CHECK | OTHER

### Catalogue & Config
- **Product** — prix HT, TVA 20% par défaut, catégorie, unité, soft-delete
- **Template** — config JSON (style CLASSIC/MODERN/MINIMAL/BOLD, primaryColor, secondaryColor, tableStyle, showSignatureBlock, showStamp, showBankDetails, footerText)
- **DocumentSequence** — DEV-YYYY-XXXX, FAC-YYYY-XXXX, AVO-YYYY-XXXX, reset annuel
- **Setting** — clé/valeur JSON par org
- **Client** — INDIVIDUAL | COMPANY, référence auto CLI-XXXX

### Logs
- **EmailLog** — traçabilité envois Resend
- **AuditLog** — journal modifications (schéma prêt, pas encore alimenté)
- **Attachment** — schéma prêt, pas encore d'upload

---

## API Routes (`/api/v1/`)

| Ressource | Endpoints |
|-----------|-----------|
| **auth** | POST register, POST forgot-password, POST reset-password, GET/PATCH me |
| **organization** | POST create, GET, PATCH |
| **clients** | GET list, POST, GET [id], PATCH [id], DELETE [id] (protégé si docs actifs) |
| **products** | GET list, POST, GET [id], PATCH [id], DELETE [id] |
| **quotes** | GET list, POST, GET [id], PATCH [id], DELETE [id], POST send/accept/reject/convert-to-invoice/duplicate, GET pdf-data |
| **invoices** | GET list, POST, GET [id], PATCH [id], DELETE [id], POST send/duplicate/mark-paid/register-payment, GET pdf-data |
| **credit-notes** | GET list, POST, GET [id], PATCH [id], DELETE [id], POST send |
| **payments** | GET list, POST, GET [id], DELETE [id] |
| **templates** | GET list, POST, GET [id], PATCH [id], DELETE [id] (protégé si utilisé), POST duplicate |
| **settings** | GET all, PATCH upsert |
| **dashboard** | GET summary (KPIs + 12 mois chart) |
| **team** | GET list, POST invite, PATCH [id], DELETE [id] |
| **search** | GET ?q= (clients, devis, factures) |
| **billing/checkout** | POST (returnUrl dans body pour cancel_url dynamique) |
| **billing/usage** | GET plan + limites |

### Webhook Stripe (`/api/webhooks/stripe`)
- `checkout.session.completed` → met à jour plan, stripeCustomerId, stripeSubscriptionId
- `customer.subscription.updated/deleted` → mise à jour plan

---

## Plans & tarification

| Plan | Prix | Features |
|------|------|----------|
| Free | 0€ | 5 devis/mois, 5 factures/mois, 2 clients |
| Pro | 15€/mois | Illimité, emails, PDF premium, templates |
| Premium | 32€/mois | Tout Pro + multi-users, analytics avancées, API |

- `PlanGate` bloque les features selon le plan avec UI lock
- `use-plan.ts` expose les feature flags
- `NEXT_PUBLIC_ENABLE_BILLING="true"` active le billing en prod

---

## Fonctionnalités implémentées ✅

- Auth complète : login, register, forgot/reset password par email
- Onboarding 4 étapes avec aperçu live (forme juridique : Particulier, AE, SARL, SAS, SASU)
- Dashboard KPIs + graphique 12 mois Recharts
- CRUD complet : clients, devis, factures, produits, avoirs, paiements, templates
- Conversion devis → facture
- PDF téléchargeable côté client (jsPDF) avec 4 styles de templates
- Templates configurables : couleur primaire/secondaire, style tableau, signature, filigrane
- Envoi email devis/factures via Resend
- Recherche globale Cmd+K
- Suppression protégée (client avec docs actifs, template utilisé)
- Statut OVERDUE automatique si dueDate dépassée
- Billing Stripe avec cancel_url dynamique (retour à la page d'origine)
- Landing page animée (Framer Motion) avec pricing
- Navigation mobile (drawer)
- Sélecteur de produits dans formulaire devis/facture
- Invalidation cache TanStack Query après mutations

## Ce qui reste à faire ❌

- AuditLog : schéma prêt, jamais alimenté
- Attachments : schéma prêt, pas d'upload UI
- Team invite : liste OK, pas d'invitation par email
- Portail client public (consulter/payer une facture)
- Relances automatiques (plan Pro)
- Statut OVERDUE : mis à jour à la lecture mais pas de job cron
- Templates PDF : styles MODERN/MINIMAL/BOLD non différenciés visuellement (couleurs OK, layout identique)

---

## Variables d'environnement

```env
DATABASE_URL="postgresql://neondb_owner:xxx@ep-xxx.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="xxx"
NEXTAUTH_URL="https://quick-devis-pro.vercel.app"
NEXT_PUBLIC_APP_URL="https://quick-devis-pro.vercel.app"
NEXT_PUBLIC_APP_NAME="QuickDevis Pro"
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH="false"
NEXT_PUBLIC_ENABLE_TEAM_FEATURE="true"
NEXT_PUBLIC_ENABLE_BILLING="true"
RESEND_API_KEY="re_xxx"
EMAIL_FROM="QuickDevis Pro <noreply@quickdevis.fr>"
STRIPE_SECRET_KEY="sk_live_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
STRIPE_PRO_PRICE_ID="price_xxx"
STRIPE_BUSINESS_PRICE_ID="price_xxx"
```

---

## Commandes utiles

```bash
# Dev
npm run dev

# Prisma
npx prisma migrate dev --name nom_migration
npx prisma generate
npx prisma studio
npx prisma db push --force-reset  # ⚠️ reset complet (dev uniquement)

# Seed
npm run db:seed   # ou: npx tsx prisma/seed.ts

# Build & deploy
npm run build
git add -A && git commit -m "feat: ..." && git push  # → Vercel déploie auto

# Claude Code
claude --dangerously-skip-permissions  # sans confirmations
# ⚠️ Si conflit auth: unset ANTHROPIC_API_KEY, puis claude, choisir No à la clé API
```

---

## Compte démo

- Email : `demo@quickdevis.fr`
- Mot de passe : `demo1234`
- Plan : PRO (activé dans le seed)

---

## Bugs connus / Points d'attention

1. `(quote as any).templateId` dans pdf-data routes — à corriger avec le bon include Prisma
2. Analytics page utilise `data: any` — types non validés
3. `getOrgId()` dupliqué dans team/route.ts — à importer depuis guards.ts
4. Versioning Stripe hardcodé en dur dans checkout et webhook
5. `console.error` en prod à wrapper dans `if (process.env.NODE_ENV !== "production")`
6. Catches vides dans certains fichiers auth → silencieux