import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Affiliate posts a contact message on one of their applications; notifies the store owner.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { marketplaceId, token, applicationId, text } = await req.json();

    if (!marketplaceId || !token || !applicationId || !text?.trim()) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const custMatches = await base44.asServiceRole.entities.StoreCustomer.filter({ marketplaceId, sessionToken: token });
    const customer = custMatches[0];
    if (!customer || customer.status === 'suspended') {
      return Response.json({ error: 'Invalid session' }, { status: 401 });
    }

    const apps = await base44.asServiceRole.entities.AffiliateApplication.filter({ id: applicationId });
    const application = apps[0];
    if (!application || application.storeCustomerId !== customer.id) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }

    const messages = Array.isArray(application.messages) ? application.messages : [];
    messages.push({
      from: 'affiliate',
      authorName: customer.fullName || customer.email || 'Affiliate',
      text: text.trim(),
      sentAt: new Date().toISOString(),
    });

    await base44.asServiceRole.entities.AffiliateApplication.update(application.id, { messages });

    // Notify the store owner.
    try {
      const ls = await base44.asServiceRole.entities.SaaSListing.filter({ id: application.listingId });
      const ownerId = ls[0]?.ownerId;
      if (ownerId) {
        await base44.asServiceRole.entities.Notification.create({
          userId: ownerId,
          type: 'affiliate_message',
          title: 'New affiliate message',
          message: `${customer.fullName || customer.email} sent a message about "${application.listingTitle}".`,
          listingId: application.listingId,
        });
      }
    } catch (_) { /* non-fatal */ }

    return Response.json({ success: true, messages });
  } catch (error) {
    console.error('affiliateMessage error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});