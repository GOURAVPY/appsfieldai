import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const marketplaceId = searchParams.get("marketplaceId");

    // Get all analytics events
    const events = await base44.asServiceRole.entities.AnalyticsEvents.list();
    
    // Get all listings for reference
    const listings = await base44.asServiceRole.entities.SaaSListing.filter({});

    // Calculate metrics
    const totalViews = events.filter(e => e.eventType === "listing_view").length;
    const totalReservations = events.filter(e => e.eventType === "reserve_spot_submit").length;
    const totalAcquisitions = events.filter(e => e.eventType === "acquisition_request_submit").length;
    const totalBids = events.filter(e => e.eventType === "bid_submit").length;
    const totalDemos = events.filter(e => e.eventType === "demo_request_submit").length;
    const totalRequests = totalReservations + totalAcquisitions + totalBids + totalDemos;
    const activeListings = listings.filter(l => l.status === "active").length;
    
    const conversionRate = totalViews > 0 ? ((totalRequests / totalViews) * 100).toFixed(2) : 0;

    // Top listings by views
    const listingViews = {};
    events.filter(e => e.eventType === "listing_view" && e.listingId).forEach(e => {
      listingViews[e.listingId] = (listingViews[e.listingId] || 0) + 1;
    });
    
    const topListings = Object.entries(listingViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([listingId, views]) => {
        const listing = listings.find(l => l.id === listingId);
        return {
          listingId,
          title: listing?.softwareName || "Unknown",
          views,
        };
      });

    // Recent activity (last 20 events)
    const recentActivity = events
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)
      .map(e => ({
        ...e,
        listingTitle: listings.find(l => l.id === e.listingId)?.softwareName || null,
      }));

    return Response.json({
      totalViews,
      totalRequests,
      conversionRate,
      totalReservations,
      totalAcquisitions,
      totalBids,
      totalDemos,
      activeListings,
      topListings,
      recentActivity,
    });

  } catch (error) {
    console.error("getAnalytics error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});