import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Store owner (app user) fetches all affiliate applications + affiliates for a marketplace they own.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { marketplaceId } = await req.json();
    if (!marketplaceId) return Response.json({ error: 'Missing marketplaceId' }, { status: 400 });

    const mpList = await base44.asServiceRole.entities.Marketplace.filter({ id: marketplaceId });
    const marketplace = mpList[0];
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    if (!marketplace || (marketplace.ownerId !== user.id && !isAdmin)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [applications, affiliates] = await Promise.all([
      base44.asServiceRole.entities.AffiliateApplication.filter({ marketplaceId }, '-created_date'),
      base44.asServiceRole.entities.Affiliate.filter({ marketplaceId }, '-created_date'),
    ]);

    return Response.json({ applications, affiliates });
  } catch (error) {
    console.error('getMarketplaceAffiliates error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});