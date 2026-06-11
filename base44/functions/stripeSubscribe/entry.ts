import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Price ID mapping for plans
const PRICE_MAP = {
  starter_monthly: "price_1Th8YjDS81YuedXlSlmssZ6p",
  starter_yearly: "price_1Th8YjDS81YuedXlU8u0bSZs",
  pro_monthly: "price_1Th8YjDS81YuedXlyZ9lGtcP",
  pro_yearly: "price_1Th8YjDS81YuedXluHRBh475",
  agency_monthly: "price_1Th8YjDS81YuedXlbGQP01ZS",
  agency_yearly: "price_1Th8YjDS81YuedXltmlY62Xs",
  enterprise_monthly: "price_1Th8YjDS81YuedXl5mJ2vJfE",
  enterprise_yearly: "price_1Th8YjDS81YuedXlBgDBRjKG",
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Login required" }, { status: 401 });

    const body = await req.json();
    const { planKey, marketplaceId } = body;
    const priceId = PRICE_MAP[planKey];
    if (!priceId) return Response.json({ error: "Invalid plan" }, { status: 400 });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return Response.json({ error: "Stripe not configured" }, { status: 500 });

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${stripeKey}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        "mode": "subscription",
        "success_url": `https://share-saas-hq.base44.app/marketplace-dashboard?session_id={CHECKOUT_SESSION_ID}`,
        "cancel_url": `https://share-saas-hq.base44.app/pricing`,
        "metadata[base44_app_id]": Deno.env.get("BASE44_APP_ID") || "",
        "metadata[userId]": user.id,
        "metadata[marketplaceId]": marketplaceId || "",
        "metadata[planKey]": planKey,
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
      }),
    });

    const session = await stripeRes.json();
    if (session.error) { console.error("Stripe error:", session.error); return Response.json({ error: session.error.message }, { status: 400 }); }

    return Response.json({ url: session.url });
  } catch (e) {
    console.error("subscribe error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});