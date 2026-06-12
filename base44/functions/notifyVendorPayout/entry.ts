import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const payoutData = body.data;

    if (!payoutData || payoutData.status !== 'paid') {
      return Response.json({ skipped: true, reason: 'Payout status is not paid' });
    }

    const vendorId = payoutData.vendorId;
    const vendorName = payoutData.vendorName || 'Vendor';
    const amount = payoutData.amount || 0;
    const payoutMethod = payoutData.payoutMethod || 'bank_transfer';
    const payoutDate = payoutData.payoutDate || new Date().toISOString();

    // Fetch vendor to get email
    let vendorEmail = '';
    try {
      const vendors = await base44.asServiceRole.entities.Vendor.filter({ id: vendorId });
      if (vendors.length > 0) {
        vendorEmail = vendors[0].email;
      }
    } catch (e) {
      console.error('Failed to fetch vendor:', e.message);
    }

    if (!vendorEmail) {
      console.error('No vendor email found for vendorId:', vendorId);
      return Response.json({ error: 'Vendor email not found' }, { status: 400 });
    }

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);

    const formattedDate = new Date(payoutDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const methodLabels = {
      bank_transfer: 'Bank Transfer',
      paypal: 'PayPal',
      stripe: 'Stripe',
      manual: 'Manual'
    };

    const subject = `💰 Payout Processed — ${formattedAmount} Sent to Your Account`;

    const bodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed, #06b6d4); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Payout Confirmed</h1>
        </div>

        <div style="background: #1a1a2e; padding: 30px; border-radius: 0 0 12px 12px; color: #e2e8f0;">
          <p style="font-size: 16px; margin-bottom: 24px;">Hello <strong>${vendorName}</strong>,</p>

          <p style="font-size: 16px; margin-bottom: 24px;">
            Great news! Your payout of <strong style="color: #06b6d4; font-size: 20px;">${formattedAmount}</strong> has been processed successfully.
          </p>

          <div style="background: #16213e; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; color: #e2e8f0;">
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Amount</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #06b6d4;">${formattedAmount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Payment Method</td>
                <td style="padding: 8px 0; text-align: right;">${methodLabels[payoutMethod] || payoutMethod}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Processed Date</td>
                <td style="padding: 8px 0; text-align: right;">${formattedDate}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #94a3b8; margin-bottom: 8px;">
            The funds should reflect in your account within 3-5 business days depending on your payment method.
          </p>

          <p style="font-size: 14px; color: #94a3b8;">
            If you have any questions, please reach out to our support team.
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #2d2d44;">
            <p style="font-size: 12px; color: #64748b;">
              This is an automated message from your marketplace platform.
            </p>
          </div>
        </div>
      </div>
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: vendorEmail,
      subject: subject,
      body: bodyHtml
    });

    console.log(`Payout email sent to ${vendorEmail} for amount ${formattedAmount}`);

    return Response.json({
      success: true,
      message: `Payout notification sent to ${vendorEmail}`
    });

  } catch (error) {
    console.error('Error in notifyVendorPayout:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});