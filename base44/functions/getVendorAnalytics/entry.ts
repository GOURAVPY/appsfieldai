import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { vendorId, marketplaceId } = await req.json();

    // ═══ STANDARD MIDDLEWARE: Auth + Tenant Access ═══
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const marketplaces = await base44.entities.Marketplace.filter({ id: marketplaceId });
    const marketplace = marketplaces[0];
    if (!marketplace) return Response.json({ error: 'Marketplace not found' }, { status: 404 });

    // ── Vendor ownership ──
    const vendor = await base44.entities.Vendor.get(vendorId);
    if (!vendor || vendor.userId !== user.id) {
      return Response.json({ error: 'Vendor not found or access denied' }, { status: 403 });
    }

    const [listings, orders, payouts] = await Promise.all([
      base44.entities.SaaSListing.filter({ vendorId, marketplaceId }),
      base44.entities.Order.filter({ vendorId, marketplaceId }, '-createdAt'),
      base44.entities.Payout.filter({ vendorId, marketplaceId }, '-payoutDate'),
    ]);

    const listingIds = listings.map(l => l.id);
    const [demos, reviews] = await Promise.all([
      listingIds.length > 0
        ? base44.entities.DemoRequest.filter({ marketplaceId }).then(all => all.filter(d => listingIds.includes(d.softwareId)))
        : Promise.resolve([]),
      listingIds.length > 0
        ? base44.entities.Review.filter({ marketplaceId }).then(all => all.filter(r => listingIds.includes(r.softwareId)))
        : Promise.resolve([]),
    ]);

    const totalSales = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.amount || 0), 0);
    const totalCommission = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.commissionAmount || 0), 0);
    const totalEarnings = totalSales - totalCommission;
    const totalPaidOut = payouts.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);

    const monthlySales = {};
    orders.filter(o => o.paymentStatus === 'paid').forEach(o => {
      const month = new Date(o.createdAt || o.created_date).toISOString().slice(0, 7);
      monthlySales[month] = (monthlySales[month] || 0) + (o.amount || 0);
    });

    return Response.json({
      vendor: { id: vendor.id, name: vendor.vendorName, status: vendor.status, email: vendor.email, commissionRate: vendor.commissionRate },
      listings: { total: listings.length, active: listings.filter(l => l.status === 'active').length, pending: listings.filter(l => l.status === 'pending').length, sold: listings.filter(l => l.status === 'sold').length },
      orders: { total: orders.length, paid: orders.filter(o => o.paymentStatus === 'paid').length, recent: orders.slice(0, 10) },
      earnings: { totalSales, totalCommission, totalEarnings, totalPaidOut, pendingBalance: Math.max(0, totalEarnings - totalPaidOut) },
      monthlySales: Object.entries(monthlySales).map(([month, amount]) => ({ month, amount })),
      demos: { total: demos.length, pending: demos.filter(d => d.status === 'pending').length },
      reviews: { total: reviews.length, approved: reviews.filter(r => r.status === 'approved').length, avgRating: reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : 0 },
      payouts: { total: payouts.length, paid: payouts.filter(p => p.status === 'paid').length, recent: payouts.slice(0, 5) },
    });
  } catch (error) {
    console.error('getVendorAnalytics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});