import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function notifyAdmins(base44, type, title, message, listingId, relatedRequestId) {
  try {
    const admins = await base44.asServiceRole.entities.User.filter({ role: "admin" });
    for (const admin of admins) {
      await base44.asServiceRole.entities.Notification.create({
        userId: admin.id,
        role: "admin",
        type,
        title,
        message,
        listingId: listingId || "",
        relatedRequestId: relatedRequestId || "",
        isRead: false,
      });
    }
  } catch (e) {
    console.error("notifyAdmins failed:", e);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // ═══ SECURITY: Authenticated users only ═══
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { listingTitle, listingId, sellerName } = body;

    // Validate required fields
    if (!listingId) {
      return Response.json({ error: 'Missing listing ID' }, { status: 400 });
    }

    // Verify the listing exists
    const listings = await base44.asServiceRole.entities.SaaSListing.filter({ id: listingId });
    if (!listings.length) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    const listing = listings[0];

    // Verify the listing belongs to current user (owner or created by)
    if (listing.ownerUserId !== user.id && listing.created_by_id !== user.id) {
      return Response.json({ error: 'Forbidden — you can only notify for your own listings' }, { status: 403 });
    }

    // In-app notification for admins
    await notifyAdmins(
      base44,
      "listing_submitted",
      "New SaaS Listing Submitted",
      `${sellerName || user.full_name || "A user"} submitted "${listingTitle || listing.softwareName || listing.title}" for review.`,
      listingId,
      ""
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("notifyAdminNewListing error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});