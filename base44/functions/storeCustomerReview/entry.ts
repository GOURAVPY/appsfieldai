import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// A store customer submits a review — allowed ONLY for verified buyers.
// A verified buyer is a customer who has a completed StoreOrder OR a
// fulfilled/payment-approved reservation for the product being reviewed.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { marketplaceId, token, listingId, rating, title, content } = await req.json();

    if (!marketplaceId || !token || !listingId || !rating || !content) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const matches = await base44.asServiceRole.entities.StoreCustomer.filter({ marketplaceId, sessionToken: token });
    const customer = matches[0];
    if (!customer || customer.status === 'suspended') {
      return Response.json({ error: 'Please sign in to leave a review' }, { status: 401 });
    }

    // Verify the customer actually purchased this product.
    const orders = await base44.asServiceRole.entities.StoreOrder.filter({
      marketplaceId, storeCustomerId: customer.id, status: 'completed',
    });
    const boughtViaOrder = orders.some((o) =>
      (o.items || []).some((it) => it.listingId === listingId) && o.paymentStatus !== 'refunded'
    );

    let boughtViaReservation = false;
    let proofOrderId = orders.find((o) => (o.items || []).some((it) => it.listingId === listingId))?.id || '';
    if (!boughtViaOrder) {
      const reservations = await base44.asServiceRole.entities.DealReservations.filter({
        marketplaceId, storeCustomerId: customer.id, listingId,
      });
      const proof = reservations.find((r) => r.status === 'fulfilled' || r.paymentApproved);
      boughtViaReservation = !!proof;
      if (proof) proofOrderId = proof.id;
    }

    if (!boughtViaOrder && !boughtViaReservation) {
      return Response.json({ error: 'Only verified buyers can review this product.' }, { status: 403 });
    }

    const listings = await base44.asServiceRole.entities.SaaSListing.filter({ id: listingId });
    const listing = listings[0];

    const review = await base44.asServiceRole.entities.Review.create({
      marketplaceId,
      softwareId: listingId,
      softwareName: listing?.softwareName || '',
      storeCustomerId: customer.id,
      userName: customer.fullName || customer.email || 'Customer',
      orderId: proofOrderId,
      verifiedBuyer: true,
      rating: Math.max(1, Math.min(5, parseInt(rating) || 5)),
      title: title || '',
      content,
      status: 'pending',
    });

    return Response.json({ success: true, review });
  } catch (error) {
    console.error('storeCustomerReview error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});