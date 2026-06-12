import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MILESTONES = [1, 5, 10, 25, 50, 100, 250, 500, 1000];

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);
    const order = body.data;

    if (!order || order.paymentStatus !== 'paid') {
      return Response.json({ skipped: true, reason: 'Not a paid order' });
    }

    const vendorId = order.vendorId;
    if (!vendorId) {
      return Response.json({ skipped: true, reason: 'No vendor on this order' });
    }

    // Count vendor's total paid orders
    const allOrders = await base44.asServiceRole.entities.Order.filter({ vendorId, paymentStatus: 'paid' });
    const totalSales = allOrders.length;

    // Check if this order hits a milestone
    const hitMilestone = MILESTONES.find(m => m === totalSales);
    if (!hitMilestone) {
      return Response.json({ skipped: true, reason: `No milestone at ${totalSales} sales` });
    }

    // Get vendor details
    const vendors = await base44.asServiceRole.entities.Vendor.filter({ id: vendorId });
    if (!vendors.length) return Response.json({ error: 'Vendor not found' }, { status: 400 });
    const vendor = vendors[0];

    const totalRevenue = allOrders.reduce((s, o) => s + (o.vendorEarning || o.amount || 0), 0);
    const formattedRevenue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalRevenue);

    // Create in-app notification
    await base44.asServiceRole.entities.Notification.create({
      userId: vendor.userId,
      role: 'user',
      type: 'deal_closed',
      title: `🎉 ${hitMilestone} Sales Milestone Reached!`,
      message: `Congratulations! You've completed ${hitMilestone} sale${hitMilestone > 1 ? 's' : ''} with total earnings of ${formattedRevenue}. Keep up the great work!`,
      listingId: order.softwareId || '',
      isRead: false,
    });

    // Send email
    if (vendor.email) {
      const subject = `🎉 Milestone Unlocked — ${hitMilestone} Sale${hitMilestone > 1 ? 's' : ''}!`;
      const bodyHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏆 Milestone Achieved!</h1>
          </div>
          <div style="background: #1a1a2e; padding: 30px; border-radius: 0 0 12px 12px; color: #e2e8f0;">
            <p style="font-size: 16px;">Hello <strong>${vendor.vendorName}</strong>,</p>
            <p style="font-size: 16px;">You just hit <strong style="color: #f59e0b; font-size: 22px;">${hitMilestone} sale${hitMilestone > 1 ? 's' : ''}</strong>! 🎉</p>
            <div style="background: #16213e; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; color: #e2e8f0;">
                <tr><td style="padding: 8px 0; color: #94a3b8;">Total Sales</td><td style="text-align: right; font-weight: bold;">${hitMilestone}</td></tr>
                <tr><td style="padding: 8px 0; color: #94a3b8;">Total Earnings</td><td style="text-align: right; font-weight: bold; color: #06b6d4;">${formattedRevenue}</td></tr>
              </table>
            </div>
            <p style="font-size: 14px; color: #94a3b8;">Keep listing great software — the next milestone is just around the corner!</p>
          </div>
        </div>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: vendor.email,
        subject,
        body: bodyHtml,
      });
    }

    return Response.json({ success: true, milestone: hitMilestone, totalSales, totalRevenue });
  } catch (error) {
    console.error('notifyVendorSalesMilestone error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});