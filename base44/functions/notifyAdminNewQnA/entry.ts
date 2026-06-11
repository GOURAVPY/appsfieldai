import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();

        // Handle both direct call and entity automation payload
        const data = body.data || body;
        const { listingTitle, question, askedByName, listingId } = data;

        const admins = await base44.asServiceRole.entities.User.filter({ role: "admin" });

        for (const admin of admins) {
            await base44.asServiceRole.entities.Notification.create({
                userId: admin.id,
                role: "admin",
                type: "reserve_submitted",
                title: "New Q&A Question",
                message: `${askedByName || "Anonymous"} asked on "${listingTitle}": ${question?.substring(0, 100)}`,
                listingId,
                isRead: false,
            });
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error("notifyAdminNewQnA error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});