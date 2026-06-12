import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // ═══ STANDARD MIDDLEWARE: Auth + Admin Role ═══
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });

    const [marketplaces, owners, plans, subscriptions] = await Promise.all([
      base44.asServiceRole.entities.Marketplace.list(),
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.SubscriptionPlan.list(),
      base44.asServiceRole.entities.PlatformSubscription.list(),
    ]);

    const ownerMap = {};
    owners.forEach(o => { ownerMap[o.id] = o.full_name || o.email; });

    const marketplaceStats = marketplaces.map(m => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      type: m.type,
      status: m.status,
      ownerName: ownerMap[m.ownerId] || 'Unknown',
      created: m.created_date,
    }));

    const planStats = plans.map(p => ({
      name: p.name,
      monthlyPrice: p.monthlyPrice,
      yearlyPrice: p.yearlyPrice,
      isActive: p.isActive,
      subscriberCount: subscriptions.filter(s => s.planName === p.name && s.status === 'active').length,
    }));

    return Response.json({
      totalMarketplaces: marketplaces.length,
      activeMarketplaces: marketplaces.filter(m => m.status === 'active').length,
      totalPlans: plans.length,
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      totalOwners: new Set(marketplaces.map(m => m.ownerId)).size,
      marketplaces: marketplaceStats.slice(0, 5),
      plans: planStats,
      recent: marketplaceStats.sort((a, b) => new Date(b.created) - new Date(a.created)).slice(0, 5),
    });
  } catch (error) {
    console.error('getSuperAdminStats error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});