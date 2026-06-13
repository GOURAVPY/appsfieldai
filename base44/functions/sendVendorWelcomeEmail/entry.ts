import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const vendorData = body.data;
    const oldData = body.old_data;

    // Only trigger when status changed to "approved"
    if (!vendorData || vendorData.status !== 'approved') {
      return Response.json({ skipped: true, reason: 'Status is not approved' });
    }

    // Ensure it's a transition from non-approved to approved
    if (oldData && oldData.status === 'approved') {
      return Response.json({ skipped: true, reason: 'Already approved before' });
    }

    const vendorName = vendorData.vendorName || 'Vendor';
    const vendorEmail = vendorData.email;
    const marketplaceId = vendorData.marketplaceId;

    if (!vendorEmail) {
      console.error('No vendor email found');
      return Response.json({ error: 'Vendor email not found' }, { status: 400 });
    }

    // Get marketplace name for personalization
    let marketplaceName = 'our marketplace';
    if (marketplaceId) {
      try {
        const marketplaces = await base44.asServiceRole.entities.Marketplace.filter({ id: marketplaceId });
        if (marketplaces.length > 0) {
          marketplaceName = marketplaces[0].name || marketplaceName;
        }
      } catch (e) {
        console.error('Failed to fetch marketplace:', e.message);
      }
    }

    const subject = `🎉 Welcome to ${marketplaceName}, ${vendorName}!`;

    const bodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316, #7c3aed); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Vendor Application Approved!</h1>
        </div>

        <div style="background: #1a1a2e; padding: 30px; border-radius: 0 0 12px 12px; color: #e2e8f0;">
          <p style="font-size: 16px; margin-bottom: 24px;">Hello <strong>${vendorName}</strong>,</p>

          <p style="font-size: 16px; margin-bottom: 24px;">
            Congratulations! Your vendor application for <strong style="color: #f97316;">${marketplaceName}</strong> has been <strong style="color: #34d399;">approved</strong>.
          </p>

          <div style="background: #16213e; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h3 style="color: #a78bfa; margin-top: 0;">🚀 Getting Started</h3>
            <ul style="color: #e2e8f0; line-height: 1.8;">
              <li>Log in to your vendor dashboard to start listing software</li>
              <li>Set up your payout method for receiving payments</li>
              <li>Create your first software listing with details & pricing</li>
              <li>Track orders, commissions, and earnings in real-time</li>
            </ul>
          </div>

          <p style="font-size: 14px; color: #94a3b8;">
            Our team is here to help you succeed. If you have any questions about listing your software, managing orders, or payouts, just reach out.
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #2d2d44;">
            <p style="font-size: 12px; color: #64748b;">
              This is an automated message from ${marketplaceName}. Welcome aboard!
            </p>
          </div>
        </div>
      </div>
    `;

    // Send welcome email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: vendorEmail,
      subject,
      body: bodyHtml,
    });

    console.log(`Welcome email sent to ${vendorEmail} for vendor ${vendorName}`);

    // Create in-app notification
    const vendorUserId = vendorData.userId;
    if (vendorUserId) {
      try {
        await base44.asServiceRole.entities.Notification.create({
          userId: vendorUserId,
          role: 'user',
          type: 'request_approved',
          title: 'Vendor Application Approved! 🎉',
          message: `Congratulations! Your vendor application for "${marketplaceName}" has been approved. Start listing your software now.`,
          listingId: '',
          relatedRequestId: '',
          isRead: false,
        });
      } catch (e) {
        console.error('Notification creation failed:', e.message);
      }
    }

    return Response.json({
      success: true,
      message: `Welcome email sent to ${vendorEmail}`,
    });
  } catch (error) {
    console.error('sendVendorWelcomeEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});