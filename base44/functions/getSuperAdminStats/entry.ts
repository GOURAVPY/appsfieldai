import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const [marketplaces, owners, plans, subscriptions] = await Promise.all([
      base44.asServiceRole.entities.Marketplace.list(),
      base44.asServiceRole.entities.MarketplaceOwnerProfile.list(),
      base44.asServiceRole.entities.SubscriptionPlan.filter({ isActive: true }),
      base44.asServiceRole.entities.PlatformSubscription.filter({ status: 'active' }),
    ]);

    return Response.json({
      marketplaces: {
        total: marketplaces.length,
        active: marketplaces.filter(m => m.status === 'active').length,
        draft: marketplaces.filter(m => m.status === 'draft').length,
        multiVendor: marketplaces.filter(m => m.type === 'multi_vendor').length,
      },
      owners: { total: owners.length },
      plans: {
        total: plans.length,
        activeSubscriptions: subscriptions.length,
        plans,
      },
      recentMarketplaces: marketplaces
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 5)
        .map(m => ({ id: m.id, name: m.name, slug: m.slug, status: m.status, type: m.type, ownerId: m.ownerId })),
    });
  } catch (error) {
    console.error('getSuperAdminStats error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});