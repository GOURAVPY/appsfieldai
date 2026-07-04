import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Returns (and lazily creates) the Affiliate record for the logged-in store customer.
// An affiliate is just a store customer who has joined the store's affiliate program.
function makeRefCode(name, id) {
  const base = (name || 'aff').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'aff';
  return `${base}${id.slice(-5)}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { marketplaceId, token, join } = await req.json();

    if (!marketplaceId || !token) {
      return Response.json({ error: 'Missing token' }, { status: 400 });
    }

    const custMatches = await base44.asServiceRole.entities.StoreCustomer.filter({ marketplaceId, sessionToken: token });
    const customer = custMatches[0];
    if (!customer || customer.status === 'suspended') {
      return Response.json({ error: 'Invalid session' }, { status: 401 });
    }

    const existing = await base44.asServiceRole.entities.Affiliate.filter({ marketplaceId, storeCustomerId: customer.id });
    let affiliate = existing[0] || null;

    // Only create on explicit join, or if they already have applications-in-flight.
    if (!affiliate && join) {
      const refCode = makeRefCode(customer.fullName, customer.id);
      affiliate = await base44.asServiceRole.entities.Affiliate.create({
        marketplaceId,
        storeCustomerId: customer.id,
        fullName: customer.fullName || '',
        email: customer.email || '',
        refCode,
        status: 'active',
        totalEarned: 0,
        totalPending: 0,
      });
    }

    return Response.json({ affiliate, isAffiliate: !!affiliate });
  } catch (error) {
    console.error('affiliateMe error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});