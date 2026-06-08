import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { fullName, email, role, registeredAt } = body;
    const adminEmail = Deno.env.get("ADMIN_EMAIL");

    // Always log the activity
    await base44.asServiceRole.entities.ActivityLog.create({
      type: "register",
      fullName: fullName || email,
      email,
      role: role || "user",
      timestamp: registeredAt,
    });

    // Try to send email if admin is configured and is a registered user
    if (!adminEmail) {
      return Response.json({ sent: false, logged: true, reason: "ADMIN_EMAIL not configured" });
    }

    const formattedTime = new Date(registeredAt).toLocaleString("en-US", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });

    try {
      await base44.integrations.Core.SendEmail({
        to: adminEmail,
        subject: "New User Registered - SaaSShare",
        body: `A new user has registered on SaaSShare.\n\nUser Details:\n- Full Name: ${fullName || email}\n- Email: ${email}\n- Role: ${role || "user"}\n- Registration Time: ${formattedTime}\n\nYou can manage users from the admin panel.\n\n— SaaSShare Notification`,
        from_name: "SaaSShare Alerts",
      });
      return Response.json({ sent: true, logged: true });
    } catch {
      return Response.json({ sent: false, logged: true, reason: "Admin not a registered app user — email skipped. Activity logged." });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});