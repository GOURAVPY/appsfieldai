import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Store owner confirms that payment was received for a reservation.
// Marks paymentApproved=true and status=fulfilled.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { reservationId, approved } = await req.json();
    if (!reservationId) return Response.json({ error: 'Missing reservationId' }, { status: 400 });

    const found = await base44.asServiceRole.entities.DealReservations.filter({ id: reservationId });
    const reservation = found[0];
    if (!reservation) return Response.json({ error: 'Reservation not found' }, { status: 404 });

    const markets = await base44.asServiceRole.entities.Marketplace.filter({ id: reservation.marketplaceId });
    const market = markets[0];
    if (!market || (market.ownerId !== user.id && user.role !== 'admin')) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const willApprove = approved !== false;
    const updated = await base44.asServiceRole.entities.DealReservations.update(reservationId, {
      paymentApproved: willApprove,
      status: willApprove ? 'fulfilled' : 'pending',
    });

    return Response.json({ success: true, reservation: updated });
  } catch (error) {
    console.error('approveReservationPayment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});