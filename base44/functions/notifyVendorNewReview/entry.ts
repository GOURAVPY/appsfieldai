import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);
    const review = body.data;

    if (!review || !review.softwareId || !review.marketplaceId) {
      return Response.json({ skipped: true, reason: 'Missing required fields' });
    }

    // Fetch the SaaS listing to get vendor info
    const listings = await base44.asServiceRole.entities.SaaSListing.filter({ id: review.softwareId });
    if (!listings.length) return Response.json({ skipped: true, reason: 'Listing not found' });
    const listing = listings[0];

    const vendorId = listing.vendorId;
    if (!vendorId) return Response.json({ skipped: true, reason: 'No vendor on this listing' });

    // Get vendor
    const vendors = await base44.asServiceRole.entities.Vendor.filter({ id: vendorId });
    if (!vendors.length) return Response.json({ skipped: true, reason: 'Vendor not found' });
    const vendor = vendors[0];

    const ratingStars = '⭐'.repeat(review.rating || 5);
    const reviewerName = review.userName || 'A buyer';
    const reviewTitle = review.title || 'New Review';
    const reviewSnippet = (review.content || '').slice(0, 150) + ((review.content || '').length > 150 ? '...' : '');

    // Create in-app notification
    await base44.asServiceRole.entities.Notification.create({
      userId: vendor.userId,
      role: 'user',
      type: 'deal_closed',
      title: `📝 New ${ratingStars} Review on "${listing.softwareName}"`,
      message: `${reviewerName} left a review: "${reviewTitle}" — ${reviewSnippet}`,
      listingId: review.softwareId,
      isRead: false,
    });

    // Send email
    if (vendor.email) {
      const subject = `📝 New ${ratingStars} Review on "${listing.softwareName}"`;
      const bodyHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #7c3aed, #06b6d4); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Review Received</h1>
          </div>
          <div style="background: #1a1a2e; padding: 30px; border-radius: 0 0 12px 12px; color: #e2e8f0;">
            <p style="font-size: 16px;">Hello <strong>${vendor.vendorName}</strong>,</p>
            <p style="font-size: 16px;"><strong>${reviewerName}</strong> just left a review on <strong>${listing.softwareName}</strong>.</p>
            <div style="background: #16213e; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="font-size: 18px; margin: 0 0 8px;">${ratingStars} — ${reviewTitle}</p>
              <p style="font-size: 14px; color: #94a3b8; margin: 0;">${reviewSnippet}</p>
            </div>
            <p style="font-size: 14px; color: #94a3b8;">Respond promptly to build trust with your buyers!</p>
          </div>
        </div>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: vendor.email,
        subject,
        body: bodyHtml,
      });
    }

    return Response.json({ success: true, vendorId, listingName: listing.softwareName, rating: review.rating });
  } catch (error) {
    console.error('notifyVendorNewReview error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});