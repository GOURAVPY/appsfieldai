import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Server-side proxy between the AppsfieldAI dashboard and the custom-domain
// Worker. The Worker's bearer secret (VERIFICATION_SECRET) lives HERE, in the
// Base44 function environment — never in the browser or the repo. This function
// authenticates the logged-in user, verifies they own the marketplace, then
// forwards register/status/delete to the Worker with the secret attached.
//
// Base44 env vars this function needs:
//   VERIFICATION_SECRET        — same value as the Worker secret
//   CUSTOM_DOMAIN_WORKER_URL   — e.g. https://api.appsfieldai.com  (optional; defaults to that)

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, hostname, marketplaceId, originType } = await req.json();
    if (!action || !marketplaceId) {
      return Response.json({ error: 'action and marketplaceId are required' }, { status: 400 });
    }

    // Ownership check — the caller must own this marketplace (or be an admin).
    const marketplace = await base44.entities.Marketplace.get(marketplaceId);
    if (!marketplace) return Response.json({ error: 'Marketplace not found' }, { status: 404 });
    if (marketplace.ownerId !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const WORKER = Deno.env.get('CUSTOM_DOMAIN_WORKER_URL') || 'https://api.appsfieldai.com';
    const SECRET = Deno.env.get('VERIFICATION_SECRET');
    if (!SECRET) return Response.json({ error: 'Server not configured (VERIFICATION_SECRET missing)' }, { status: 500 });
    const authHeaders = { Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' };

    let res;
    if (action === 'register') {
      res = await fetch(`${WORKER}/api/custom-domains/register`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          hostname,
          tenantId: marketplaceId,
          originType: originType || 'app',
          storeSlug: marketplace.subdomain || marketplace.slug,
        }),
      });
    } else if (action === 'status') {
      res = await fetch(`${WORKER}/api/custom-domains/status?hostname=${encodeURIComponent(hostname)}`, {
        headers: authHeaders,
      });
    } else if (action === 'delete') {
      res = await fetch(`${WORKER}/api/custom-domains?hostname=${encodeURIComponent(hostname)}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
    } else {
      return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

    const data = await res.json().catch(() => ({}));
    return Response.json(data, { status: res.status });
  } catch (error) {
    console.error('customDomainProxy error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
