import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function makeRefCode(name, id) {
  const base = (name || 'aff').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'aff';
  return `${base}${id.slice(-5)}`;
}

// A store customer applies to become an affiliate for a specific product.
// Auto-creates their Affiliate record on first apply, then records the application with Q&A answers.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { marketplaceId, token, listingId, answers } = await req.json();

    if (!marketplaceId || !token || !listingId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const custMatches = await base44.asServiceRole.entities.StoreCustomer.filter({ marketplaceId, sessionToken: token });
    const customer = custMatches[0];
    if (!customer || customer.status === 'suspended') {
      return Response.json({ error: 'Please sign in to apply' }, { status: 401 });
    }

    const ls = await base44.asServiceRole.entities.SaaSListing.filter({ id: listingId });
    const listing = ls[0];
    if (!listing || listing.marketplaceId !== marketplaceId) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }
    if (!listing.affiliateEnabled) {
      return Response.json({ error: 'This product is not open for affiliates' }, { status: 400 });
    }

    // Ensure the Affiliate record exists.
    const existing = await base44.asServiceRole.entities.Affiliate.filter({ marketplaceId, storeCustomerId: customer.id });
    let affiliate = existing[0] || null;
    if (!affiliate) {
      affiliate = await base44.asServiceRole.entities.Affiliate.create({
        marketplaceId,
        storeCustomerId: customer.id,
        fullName: customer.fullName || '',
        email: customer.email || '',
        refCode: makeRefCode(customer.fullName, customer.id),
        status: 'active',
        totalEarned: 0,
        totalPending: 0,
      });
    }

    // One application per product per affiliate.
    const dup = await base44.asServiceRole.entities.AffiliateApplication.filter({ affiliateId: affiliate.id, listingId });
    if (dup.length) {
      return Response.json({ error: 'You have already applied to promote this product', application: dup[0] }, { status: 409 });
    }

    const application = await base44.asServiceRole.entities.AffiliateApplication.create({
      marketplaceId,
      affiliateId: affiliate.id,
      storeCustomerId: customer.id,
      affiliateName: customer.fullName || '',
      affiliateEmail: customer.email || '',
      listingId,
      listingTitle: listing.softwareName || '',
      answers: Array.isArray(answers) ? answers : [],
      status: 'pending',
      messages: [],
    });

    // Notify the store owner about the new application.
    try {
      await base44.asServiceRole.entities.Notification.create({
        userId: listing.ownerId || '',
        type: 'affiliate_application',
        title: 'New affiliate application',
        message: `${customer.fullName || customer.email} applied to promote "${listing.softwareName}".`,
        listingId,
      });
    } catch (_) { /* notification entity may differ — non-fatal */ }

    return Response.json({ success: true, application, affiliate });
  } catch (error) {
    console.error('affiliateApply error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});