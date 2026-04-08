import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";
import { requireAuth, getOrgId } from "@/lib/auth/guards";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

const PRICE_IDS: Record<string, string> = {
  pro: process.env.STRIPE_PRO_PRICE_ID!,
  premium: process.env.STRIPE_BUSINESS_PRICE_ID!,
};

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.ok) return authResult.response;

  const { token } = authResult;
  const userId = token.id as string;

  const organizationId = await getOrgId(userId);
  if (!organizationId) {
    return NextResponse.json({ error: "No organization found" }, { status: 400 });
  }

  let plan: string;
  try {
    const body = await req.json();
    plan = body.plan?.toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { stripeCustomerId: true, stripeSubscriptionId: true },
  });

  // Vérifie si un abonnement actif existe déjà sur Stripe
  if (org?.stripeSubscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(org.stripeSubscriptionId);
      if (sub.status === "active" || sub.status === "trialing") {
        return NextResponse.json(
          { error: "Vous avez déjà un abonnement actif." },
          { status: 400 }
        );
      }
    } catch {
      // Subscription introuvable sur Stripe → on laisse passer
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { organizationId },
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/#tarifs`,
    };

    // Réutilise le customer Stripe existant si disponible
    if (org?.stripeCustomerId) {
      sessionParams.customer = org.stripeCustomerId;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[billing/checkout] Stripe error:", err);
    return NextResponse.json({ error: "Impossible de créer la session de paiement" }, { status: 500 });
  }
}
