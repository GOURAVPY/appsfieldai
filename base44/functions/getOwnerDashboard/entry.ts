import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { marketplaceId } = await req.json();

    // ═══ STANDARD MIDDLEWARE: Auth + Tenant Ownership ═══
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const marketplaces = await base44.entities.Marketplace.filter({ id: marketplaceId });
    const marketplace = marketplaces[0];
    if (!marketplace) return Response.json({ error: 'Marketplace not found' }, { status: 404 });
    if (marketplace.status === 'suspended') return Response.json({ error: 'Marketplace is suspended' }, { status: 403 });
    if (marketplace.ownerId !== user.id) return Response.json({ error: 'Forbidden — you do not own this marketplace' }, { status: 403 });

    const [listings, vendors, orders, payouts, demos, reviews, customers] = await Promise.all([
      base44.entities.SaaSListing.filter({ marketplaceId }),
      base44.entities.Vendor.filter({ marketplaceId }),
      base44.entities.Order.filter({ marketplaceId }),
      base44.entities.Payout.filter({ marketplaceId }),
      base44.entities.DemoRequest.filter({ marketplaceId }),
      base44.entities.Review.filter({ marketplaceId }),
      base44.asServiceRole.entities.CustomerProfile.filter({ marketplaceId }),
    ]);

    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((s, o) => s + (o.amount || 0), 0);
    const totalCommission = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((s, o) => s + (o.commissionAmount || 0), 0);
    const totalPaidOut = payouts
      .filter(p => p.status === 'paid')
      .reduce((s, p) => s + (p.amount || 0), 0);

    return Response.json({
      listings: { total: listings.length, pending: listings.filter(l => l.status === 'pending').length, approved: listings.filter(l => l.status === 'approved' || l.status === 'active').length, rejected: listings.filter(l => l.status === 'rejected').length },
      vendors: { total: vendors.length, pending: vendors.filter(v => v.status === 'pending').length, approved: vendors.filter(v => v.status === 'approved').length, suspended: vendors.filter(v => v.status === 'suspended').length },
      orders: { total: orders.length, paid: orders.filter(o => o.paymentStatus === 'paid').length, pending: orders.filter(o => o.paymentStatus === 'pending').length, refunded: orders.filter(o => o.paymentStatus === 'refunded').length },
      revenue: { total: totalRevenue, commission: totalCommission, net: totalRevenue - totalCommission },
      payouts: { total: payouts.length, paid: payouts.filter(p => p.status === 'paid').length, pending: payouts.filter(p => p.status === 'pending').length, totalPaidOut },
      demos: { total: demos.length, pending: demos.filter(d => d.status === 'pending').length, scheduled: demos.filter(d => d.status === 'scheduled').length, completed: demos.filter(d => d.status === 'completed').length },
      reviews: { total: reviews.length, pending: reviews.filter(r => r.status === 'pending').length, approved: reviews.filter(r => r.status === 'approved').length },
      customers: { total: customers.length },
    });
  } catch (error) {
    console.error('getOwnerDashboard error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});