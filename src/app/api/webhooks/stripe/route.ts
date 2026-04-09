import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_placeholder", {
  apiVersion: "2026-03-25.dahlia",
});

// Mapping Price ID → plan
function getPlanFromPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "PRO";
  if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) return "BUSINESS";
  return "FREE";
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = session.metadata?.organizationId;

        if (!organizationId || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const priceId = subscription.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId);

        await prisma.organization.update({
          where: { id: organizationId },
          data: {
            plan,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId);

        await prisma.organization.updateMany({
          where: { stripeCustomerId: subscription.customer as string },
          data: { plan, stripeSubscriptionId: subscription.id },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.organization.updateMany({
          where: { stripeCustomerId: subscription.customer as string },
          data: { plan: "FREE", stripeSubscriptionId: null },
        });
        break;
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("[stripe-webhook] Error processing event:", event.type, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
