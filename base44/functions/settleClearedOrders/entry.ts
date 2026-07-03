import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Scheduled: marks paid, completed, non-refunded orders as payout-eligible once
// they've cleared the refund window (default 7 days since payment).
// Vendor payout balances only reflect cleared funds, so a seller can never
// request payout for orders that are still refundable or already refunded.
const REFUND_WINDOW_DAYS = 7;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const cutoff = Date.now() - REFUND_WINDOW_DAYS * 86400000;
    // Candidate orders: paid, delivered, not refunded, not yet marked eligible.
    const orders = await base44.asServiceRole.entities.StoreOrder.filter({
      paymentStatus: 'paid', status: 'completed', payoutEligible: false,
    });

    let cleared = 0;
    for (const o of orders) {
      const paidAtMs = o.paidAt ? new Date(o.paidAt).getTime() : new Date(o.created_date).getTime();
      if (paidAtMs > cutoff) continue; // still inside refund window

      await base44.asServiceRole.entities.StoreOrder.update(o.id, { payoutEligible: true });

      // Credit the vendor's payout balance now that the funds have cleared.
      if (o.vendorId) {
        const vendors = await base44.asServiceRole.entities.Vendor.filter({ id: o.vendorId });
        const vendor = vendors[0];
        if (vendor) {
          const mps = await base44.asServiceRole.entities.Marketplace.filter({ id: o.marketplaceId });
          const commissionRate = mps[0]?.settings?.commissionRate || 0;
          const vendorEarning = (o.total || 0) * (1 - commissionRate / 100);
          await base44.asServiceRole.entities.Vendor.update(vendor.id, {
            payoutBalance: (vendor.payoutBalance || 0) + vendorEarning,
            totalSales: (vendor.totalSales || 0) + (o.total || 0),
          });
          await base44.asServiceRole.entities.LedgerEntry.create({
            marketplaceId: o.marketplaceId, action: 'vendor_credit', amount: vendorEarning,
            orderId: o.id, vendorId: vendor.id,
            note: `Funds cleared refund window — credited to vendor payout balance`,
          });
        }
      }
      cleared++;
    }

    return Response.json({ success: true, cleared });
  } catch (error) {
    console.error('settleClearedOrders error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});