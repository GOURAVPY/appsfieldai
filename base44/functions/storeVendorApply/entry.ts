import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { marketplaceId, vendorName, email, phone, description } = await req.json();

    if (!marketplaceId || !vendorName || !email) {
      return Response.json({ error: 'Please fill all required fields' }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // Ensure the marketplace exists
    const markets = await base44.asServiceRole.entities.Marketplace.filter({ id: marketplaceId });
    if (!markets.length) {
      return Response.json({ error: 'Store not found' }, { status: 404 });
    }

    // Prevent duplicate pending/approved applications for the same email on this store.
    const existing = await base44.asServiceRole.entities.Vendor.filter({ marketplaceId, email: cleanEmail });
    if (existing.some(v => v.status === 'pending' || v.status === 'approved')) {
      return Response.json({ error: 'An application with this email already exists for this store.' }, { status: 409 });
    }

    const vendor = await base44.asServiceRole.entities.Vendor.create({
      marketplaceId,
      userId: cleanEmail, // store applicants are not app users; key by email
      vendorName,
      email: cleanEmail,
      phone: phone || '',
      description: description || '',
      status: 'pending',
      appliedAt: new Date().toISOString(),
    });

    return Response.json({ success: true, vendorId: vendor.id });
  } catch (error) {
    console.error('storeVendorApply error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});