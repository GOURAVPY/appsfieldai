import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Reusable email sender backed by Resend.
// Payload: { to, subject, html, fromName?, fromEmail?, replyTo? }
// The "from" address must be on a domain you've verified in Resend.
// Falls back to Resend's shared onboarding sender if no verified from is provided.

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      console.error('RESEND_API_KEY not set');
      return Response.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const { to, subject, html, fromName, fromEmail, replyTo } = await req.json();

    if (!to || !subject || !html) {
      return Response.json({ error: 'Missing to, subject, or html' }, { status: 400 });
    }

    // Resolve the from address. Prefer an explicit verified sender, else pull the
    // configured support email from AppConfig, else use Resend's shared onboarding domain.
    let resolvedFromEmail = fromEmail || '';
    let resolvedFromName = fromName || 'Notifications';
    if (!resolvedFromEmail) {
      try {
        const base44 = createClientFromRequest(req);
        const cfgs = await base44.asServiceRole.entities.AppConfig.filter({ key: 'general' });
        const cfg = cfgs[0];
        if (cfg) {
          resolvedFromName = fromName || cfg.siteName || resolvedFromName;
        }
      } catch (_) { /* config optional */ }
      // Resend's shared testing sender (works without domain verification).
      resolvedFromEmail = 'onboarding@resend.dev';
    }

    const from = `${resolvedFromName} <${resolvedFromEmail}>`;

    const payload: Record<string, unknown> = { from, to, subject, html };
    if (replyTo) payload.reply_to = replyTo;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Resend error:', res.status, JSON.stringify(data));
      return Response.json({ error: data?.message || 'Failed to send email', details: data }, { status: res.status });
    }

    return Response.json({ success: true, id: data?.id });
  } catch (error) {
    console.error('sendEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});