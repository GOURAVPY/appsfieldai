import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();

        // Handle both direct call and entity automation payload
        const data = body.data || body;
        const { content, listingId } = data;

        // Get sender and receiver names
        let senderName = "Someone";
        let receiverName = "Someone";
        let listingTitle = "a listing";

        try {
            if (data.senderId) {
                const sender = await base44.asServiceRole.entities.User.filter({ id: data.senderId });
                senderName = sender[0]?.full_name || sender[0]?.email || "Someone";
            }
            if (data.receiverId) {
                const receiver = await base44.asServiceRole.entities.User.filter({ id: data.receiverId });
                receiverName = receiver[0]?.full_name || receiver[0]?.email || "Someone";
            }
            if (listingId) {
                const listings = await base44.asServiceRole.entities.SaaSListing.filter({ id: listingId });
                listingTitle = listings[0]?.title || "a listing";
            }
        } catch (e) {
            console.error("Failed to fetch names:", e);
        }

        const admins = await base44.asServiceRole.entities.User.filter({ role: "admin" });

        for (const admin of admins) {
            await base44.asServiceRole.entities.Notification.create({
                userId: admin.id,
                role: "admin",
                type: "reserve_submitted",
                title: "New Chat Message",
                message: `${senderName} → ${receiverName} on "${listingTitle}": ${content?.substring(0, 100)}`,
                listingId,
                isRead: false,
            });
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error("notifyAdminNewMessage error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});