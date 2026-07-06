import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Returns the logged-in affiliate's applications with live status, message thread,
// their referral link params, and — for approved products — the full promotion kit.
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
      return Response.json({ applications: [], refCode: null });
    }

    const apps = await base44.asServiceRole.entities.AffiliateApplication.filter(
      { affiliateId: affiliate.id }, '-created_date'
    );

    const applications = await Promise.all(apps.map(async (a) => {
      let listing = null;
      try {
        const found = await base44.asServiceRole.entities.SaaSListing.filter({ id: a.listingId });
        listing = found[0] || null;
      } catch (_) { /* product may be deleted */ }
      const approved = a.status === 'approved';
      const rate = a.commissionRate ?? listing?.affiliateCommissionRate ?? 30;
      return {
        id: a.id,
        listingId: a.listingId,
        listingTitle: a.listingTitle,
        status: a.status,
        commissionRate: rate,
        reviewNotes: a.reviewNotes || '',
        messages: a.messages || [],
        answers: a.answers || [],
        createdAt: a.created_date,
        listing: listing ? {
          logo: listing.logo,
          imageGradient: listing.imageGradient,
          category: listing.category,
          price: (listing.sharePrice || 0) * (listing.totalShares || 0) || listing.price || 0,
          shortDescription: listing.shortDescription,
        } : null,
        // Promotion kit only exposed for approved products.
        promotionKit: approved ? (listing?.promotionKit || {}) : null,
      };
    }));

    return Response.json({
      applications,
      refCode: affiliate.refCode,
      affiliateId: affiliate.id,
    });
  } catch (error) {
    console.error('affiliateApplications error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});