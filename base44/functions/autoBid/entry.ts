import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // ═══ SECURITY: Admin/system only ═══
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { data: newBid } = body;

    if (!newBid || !newBid.listingId) {
      return Response.json({ error: 'Missing bid data' }, { status: 400 });
    }

    // Validate listing exists and is in auction status
    const listings = await base44.asServiceRole.entities.SaaSListing.filter({ id: newBid.listingId });
    if (!listings.length || listings[0].status !== 'auction') {
      return Response.json({ error: 'Invalid or inactive listing' }, { status: 400 });
    }

    const listingId = newBid.listingId;
    const newBidAmount = newBid.bidAmount;
    const newBidUserId = newBid.userId;

    // Get all other auto-bids for this listing (excluding the new bid's user)
    const allBids = await base44.asServiceRole.entities.Bid.filter(
      { listingId, autoBid: true },
      "-created_date"
    );

    // Group by userId, keep only the latest bid per user
    const latestPerUser = {};
    for (const bid of allBids) {
      if (bid.userId === newBidUserId) continue;
      if (!latestPerUser[bid.userId] || bid.bidAmount > latestPerUser[bid.userId].bidAmount) {
        latestPerUser[bid.userId] = bid;
      }
    }

    // For each user with auto-bid, check if they need to be outbid
    for (const userId of Object.keys(latestPerUser)) {
      const bid = latestPerUser[userId];
      const maxAuto = bid.maxAutoBid || bid.bidAmount;

      // If the new bid outbids them and their max auto-bid covers it
      if (newBidAmount >= bid.bidAmount && maxAuto > newBidAmount) {
        const autoAmount = Math.min(maxAuto, Math.ceil((newBidAmount + 1) / 5) * 5);

        await base44.asServiceRole.entities.Bid.create({
          userId,
          listingId,
          bidAmount: autoAmount,
          autoBid: true,
          maxAutoBid: maxAuto,
        });

        // Notify the auto-bidder
        try {
          await base44.asServiceRole.entities.Notification.create({
            userId,
            role: "user",
            type: "outbid",
            title: "Auto-Bid Placed",
            message: `Auto-bid of $${autoAmount.toLocaleString()} placed on listing to keep your position.`,
            listingId,
            isRead: false,
          });
        } catch (_) {}
      }
    }

    return Response.json({ message: "Auto-bid check complete" });
  } catch (error) {
    console.error("autoBid error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});