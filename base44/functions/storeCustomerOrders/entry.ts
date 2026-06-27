import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Returns a store customer's purchased orders (cart checkout).
// Software access / delivery info is only revealed once the order is marked
// "completed" (delivered) by the store owner.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { marketplaceId, token } = await req.json();

    if (!marketplaceId || !token) {
      return Response.json({ error: 'Missing token' }, { status: 400 });
    }

    const matches = await base44.asServiceRole.entities.StoreCustomer.filter({ marketplaceId, sessionToken: token });
    const customer = matches[0];
    if (!customer || customer.status === 'suspended') {
      return Response.json({ error: 'Invalid session' }, { status: 401 });
    }

    const rawOrders = await base44.asServiceRole.entities.StoreOrder.filter(
      { marketplaceId, storeCustomerId: customer.id },
      '-created_date'
    );

    const orders = rawOrders.map((o) => {
      const delivered = o.status === 'completed';
      return {
        id: o.id,
        items: o.items || [],
        total: o.total || 0,
        currency: o.currency || 'USD',
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        status: o.status,
        createdAt: o.created_date,
        notes: o.notes || '',
        // Only expose access info once the order is delivered.
        delivery: delivered ? (o.delivery || null) : null,
      };
    });

    return Response.json({ orders });
  } catch (error) {
    console.error('storeCustomerOrders error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});