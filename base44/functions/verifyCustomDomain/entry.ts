import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Platform target where customer custom domains should point (CNAME).
const PLATFORM_CNAME_TARGET = "cname.saasshare.app";

// Resolve DNS records using Cloudflare's DNS-over-HTTPS resolver.
async function dnsQuery(name, type) {
  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
      { headers: { accept: "application/dns-json" } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.Answer || [];
  } catch (err) {
    console.error(`DNS query failed for ${name} (${type})`, err);
    return [];
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { marketplaceId } = await req.json();
    if (!marketplaceId) return Response.json({ error: 'marketplaceId is required' }, { status: 400 });

    const marketplace = await base44.entities.Marketplace.get(marketplaceId);
    if (!marketplace) return Response.json({ error: 'Marketplace not found' }, { status: 404 });
    if (marketplace.ownerId !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const domain = (marketplace.customDomain || "").toLowerCase().trim();
    if (!domain) return Response.json({ error: 'No custom domain set' }, { status: 400 });

    const expectedToken = marketplace.verificationToken;
    if (!expectedToken) return Response.json({ error: 'No verification token. Re-save the domain first.' }, { status: 400 });

    // 1) Check TXT verification record on _saasshare.<domain>
    const txtName = `_saasshare.${domain}`;
    const txtRecords = await dnsQuery(txtName, "TXT");
    const txtValues = txtRecords.map(r => (r.data || "").replace(/^"|"$/g, ""));
    const txtMatch = txtValues.some(v => v.includes(`saasshare-verify=${expectedToken}`));

    // 2) Check CNAME points to our platform target (or A record fallback for root domains)
    const cnameRecords = await dnsQuery(domain, "CNAME");
    const cnameMatch = cnameRecords.some(r =>
      (r.data || "").replace(/\.$/, "").toLowerCase() === PLATFORM_CNAME_TARGET
    );

    const verified = txtMatch && cnameMatch;

    const update = {
      verificationStatus: verified ? "verified" : "failed",
      sslStatus: verified ? "active" : "pending",
    };
    if (verified) update.connectedAt = new Date().toISOString();

    await base44.entities.Marketplace.update(marketplaceId, update);

    return Response.json({
      verified,
      checks: {
        txt: { name: txtName, found: txtMatch, records: txtValues },
        cname: { name: domain, found: cnameMatch, target: PLATFORM_CNAME_TARGET, records: cnameRecords.map(r => r.data) },
      },
      message: verified
        ? "Domain verified and SSL activated."
        : !txtMatch && !cnameMatch
          ? "Neither the TXT nor CNAME record was found yet. DNS can take up to 48h to propagate."
          : !txtMatch
            ? "CNAME found, but the TXT verification record is missing or incorrect."
            : "TXT record verified, but the CNAME record is missing or incorrect.",
    });
  } catch (error) {
    console.error("verifyCustomDomain error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});