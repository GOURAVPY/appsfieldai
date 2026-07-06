import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Refund orchestrator for a store order.
// Only the marketplace owner or an admin may call this.
// It performs the full refund lifecycle in one place:
//   1. Marks the order refunded + revokes buyer access.
//   2. Reverses the vendor's uncleared payout balance (never below zero).
//   3. Writes audit ledger entries for the refund and any balance reversal.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId } = await req.json();
    if (!orderId) return Response.json({ error: 'Missing orderId' }, { status: 400 });

    const orders = await base44.asServiceRole.entities.StoreOrder.filter({ id: orderId });
    const order = orders[0];
    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

    // Authorize: admin OR the owner of the marketplace this order belongs to.
    const mps = await base44.asServiceRole.entities.Marketplace.filter({ id: order.marketplaceId });
    const marketplace = mps[0];
    const isOwner = marketplace && marketplace.ownerId === user.id;
    if (user.role !== 'admin' && !isOwner) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (order.paymentStatus === 'refunded') {
      return Response.json({ success: true, alreadyRefunded: true });
    }

    // 1. Update the order — refunded, access revoked, no longer payout-eligible.
    await base44.asServiceRole.entities.StoreOrder.update(order.id, {
      paymentStatus: 'refunded',
      status: 'cancelled',
      accessStatus: 'revoked',
      payoutEligible: false,
      refundedAt: new Date().toISOString(),
    });

    // 2. Reverse uncleared vendor balance (if there is a vendor and balance).
    let reversed = 0;
    if (order.vendorId) {
      const vendors = await base44.asServiceRole.entities.Vendor.filter({ id: order.vendorId });
      const vendor = vendors[0];
      if (vendor) {
        const commissionRate = marketplace?.settings?.commissionRate || 0;
        const vendorEarning = (order.total || 0) * (1 - commissionRate / 100);
        reversed = Math.min(vendor.payoutBalance || 0, vendorEarning);
        if (reversed > 0) {
          await base44.asServiceRole.entities.Vendor.update(vendor.id, {
            payoutBalance: (vendor.payoutBalance || 0) - reversed,
          });
          await base44.asServiceRole.entities.LedgerEntry.create({
            marketplaceId: order.marketplaceId, action: 'payout_reversed', amount: -reversed,
            orderId: order.id, vendorId: vendor.id, actorId: user.id, actorName: user.full_name || '',
            note: `Reversed uncleared vendor balance on refund of order ${order.id}`,
          });
        }
      }
    }

    // 2b. Reverse affiliate commissions on this order (hold or already-cleared → refunded).
    if (order.affiliateId) {
      const comms = await base44.asServiceRole.entities.AffiliateCommission.filter({ orderId: order.id });
      const affs = await base44.asServiceRole.entities.Affiliate.filter({ id: order.affiliateId });
      const aff = affs[0];
      let holdBack = 0;
      let earnedBack = 0;
      for (const c of comms) {
        if (c.status === 'refunded') continue;
        if (c.status === 'hold') holdBack += c.amount || 0;
        else if (c.status === 'sale') earnedBack += c.amount || 0;
        await base44.asServiceRole.entities.AffiliateCommission.update(c.id, { status: 'refunded' });
      }
      if (aff && (holdBack > 0 || earnedBack > 0)) {
        await base44.asServiceRole.entities.Affiliate.update(aff.id, {
          totalPending: Math.max(0, (aff.totalPending || 0) - holdBack),
          totalEarned: Math.max(0, (aff.totalEarned || 0) - earnedBack),
        });
      }
    }

    // 3. Audit ledger for the refund itself + access revocation.
    await base44.asServiceRole.entities.LedgerEntry.create({
      marketplaceId: order.marketplaceId, action: 'refund', amount: -(order.total || 0),
      orderId: order.id, vendorId: order.vendorId || '', actorId: user.id, actorName: user.full_name || '',
      note: `Refund issued for order ${order.id}`,
      metadata: { customerEmail: order.customerEmail, reversedVendorBalance: reversed },
    });
    await base44.asServiceRole.entities.LedgerEntry.create({
      marketplaceId: order.marketplaceId, action: 'access_revoked', orderId: order.id,
      actorId: user.id, actorName: user.full_name || '',
      note: `Buyer access revoked after refund of order ${order.id}`,
    });

    return Response.json({ success: true, reversedVendorBalance: reversed });
  } catch (error) {
    console.error('refundStoreOrder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});