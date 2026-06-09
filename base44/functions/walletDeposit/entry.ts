import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { amount } = body;

    if (!amount || amount < 1) {
      return Response.json({ error: 'Amount must be at least $1' }, { status: 400 });
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return Response.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const amountCents = Math.round(amount * 100);

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'mode': 'payment',
        'success_url': `https://share-saas-hq.base44.app/wallet`,
        'cancel_url': `https://share-saas-hq.base44.app/wallet`,
        'metadata[base44_app_id]': Deno.env.get('BASE44_APP_ID') || '',
        'metadata[type]': 'wallet_deposit',
        'metadata[userId]': user.id,
        'metadata[amount]': String(amount),
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][product_data][name]': 'Wallet Top-Up',
        'line_items[0][price_data][product_data][description]': `Add $${amount} to your wallet`,
        'line_items[0][price_data][unit_amount]': String(amountCents),
        'line_items[0][quantity]': '1',
      }),
    });

    const session = await stripeRes.json();

    if (session.error) {
      console.error('Stripe error:', session.error);
      return Response.json({ error: session.error.message }, { status: 400 });
    }

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Wallet deposit error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});