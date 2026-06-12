import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * STANDARD AUTH PATTERN for backend functions:
 *   const { user, marketplace } = await checkAuth(base44, { action: 'tenantOwner', marketplaceId, requiredRole: 'admin' });
 */

async function checkAuth(base44, opts = {}) {
  const { action, marketplaceId, requiredRole, checkLimit } = opts;

  // 1. Auth
  const user = await base44.auth.me();
  if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });

  // 2. Role
  if (requiredRole && user.role !== requiredRole) {
    throw Object.assign(new Error(`Forbidden — ${requiredRole} access required`), { status: 403 });
  }

  // 3-5. Marketplace
  if (marketplaceId && action) {
    const marketplaces = await base44.entities.Marketplace.filter({ id: marketplaceId });
    const marketplace = marketplaces[0];
    if (!marketplace) throw Object.assign(new Error('Marketplace not found'), { status: 404 });
    if (marketplace.status === 'suspended') throw Object.assign(new Error('Marketplace is suspended'), { status: 403 });
    if (action === 'tenantOwner' && marketplace.ownerId !== user.id) {
      throw Object.assign(new Error('Forbidden — you do not own this marketplace'), { status: 403 });
    }

    // 6. Plan limits
    if (action === 'planLimit' && checkLimit) {
      const subscriptions = await base44.entities.PlatformSubscription.filter({ marketplaceId, status: 'active' });
      const sub = subscriptions[0];
      if (!sub) throw Object.assign(new Error('No active subscription'), { status: 402 });

      const plans = await base44.entities.SubscriptionPlan.filter({ name: sub.planName });
      const plan = plans[0];

      const limitMap = {
        listings: { entity: base44.entities.SaaSListing, field: 'productLimit', label: 'listings' },
        vendors: { entity: base44.entities.Vendor, field: 'vendorLimit', label: 'vendors', query: { status: 'approved' } },
        orders: { entity: base44.entities.Order, field: 'orderLimit', label: 'orders' },
        customers: { entity: base44.entities.CustomerProfile, field: 'customerLimit', label: 'customers' },
      };

      const cfg = limitMap[checkLimit];
      if (cfg) {
        const items = await cfg.entity.filter({ marketplaceId, ...(cfg.query || {}) });
        const limit = plan[cfg.field];
        if (limit !== null && limit !== undefined && items.length >= limit) {
          throw Object.assign(new Error(`Plan limit reached — ${cfg.label}: ${items.length}/${limit}`), { status: 403 });
        }
      }

      return { user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name }, marketplace, subscription: sub, plan };
    }

    return { user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name }, marketplace };
  }

  return { user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name } };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const params = await req.json();
    const result = await checkAuth(base44, params);
    return Response.json(result);
  } catch (error) {
    console.error('middleware error:', error);
    return Response.json({ error: error.message, status: error.status || 500 }, { status: error.status || 500 });
  }
});