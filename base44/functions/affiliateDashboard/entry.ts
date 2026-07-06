import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Returns the affiliate's revenue dashboard: commission transactions (sale/hold/refunded) + totals.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { marketplaceId, token } = await req.json();

    if (!marketplaceId || !token) {
      return Response.json({ error: 'Missing token' }, { status: 400 });
    }

    const custMatches = await base44.asServiceRole.entities.StoreCustomer.filter({ marketplaceId, sessionToken: token });
    const customer = custMatches[0];
    if (!customer || customer.status === 'suspended') {
      return Response.json({ error: 'Invalid session' }, { status: 401 });
    }

    const affMatches = await base44.asServiceRole.entities.Affiliate.filter({ marketplaceId, storeCustomerId: customer.id });
    const affiliate = affMatches[0];
    if (!affiliate) {
      return Response.json({ transactions: [], totals: { cleared: 0, hold: 0, refunded: 0, sales: 0 } });
    }

    const commissions = await base44.asServiceRole.entities.AffiliateCommission.filter(
      { affiliateId: affiliate.id }, '-created_date'
    );

    const totals = { cleared: 0, hold: 0, refunded: 0, sales: 0 };
    commissions.forEach((c) => {
      const amt = c.amount || 0;
      if (c.status === 'sale') { totals.cleared += amt; totals.sales += 1; }
      else if (c.status === 'hold') { totals.hold += amt; totals.sales += 1; }
      else if (c.status === 'refunded') { totals.refunded += amt; }
    });

    const transactions = commissions.map((c) => ({
      id: c.id,
      listingTitle: c.listingTitle,
      orderTotal: c.orderTotal || 0,
      commissionRate: c.commissionRate || 0,
      amount: c.amount || 0,
      currency: c.currency || 'USD',
      status: c.status,
      createdAt: c.created_date,
    }));

    return Response.json({
      transactions,
      totals,
      refCode: affiliate.refCode,
    });
  } catch (error) {
    console.error('affiliateDashboard error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});