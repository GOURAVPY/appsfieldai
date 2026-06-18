import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const body = await req.json();
    const { eventType, listingId, metadata } = body;

    if (!eventType) {
      return Response.json({ error: "eventType is required" }, { status: 400 });
    }

    // Get user if authenticated
    let userId = null;
    try {
      const user = await base44.auth.me();
      userId = user?.id || null;
    } catch {
      // Not authenticated - that's OK for public events
    }

    // Create analytics event
    await base44.entities.AnalyticsEvents.create({
      userId,
      listingId: listingId || null,
      eventType,
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("trackAnalytics error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});