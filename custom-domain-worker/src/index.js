// Cloudflare Worker for AppsfieldAI custom domains.
//
// One Worker does everything (no separate origin server):
//   • On its own API host (the *.workers.dev URL or ADMIN_HOST): serves the admin
//     API (add/verify/remove domains) + the public domain-for-store lookup.
//   • On every customer custom hostname (caught by the `*/*` route): reverse-proxies
//     the request to the Base44 app and rewrites SEO tags in the HTML.
//
// State lives in Cloudflare KV (binding: DOMAINS). Certificates + hostname
// validation are handled by Cloudflare for SaaS via the custom_hostnames API.

export default {
  async fetch(request, env, url) {
    const u = new URL(request.url);
    const host = (request.headers.get("host") || u.hostname).toLowerCase().split(":")[0];

    const adminHost = (env.ADMIN_HOST || "").toLowerCase();
    const isApiHost = host.endsWith(".workers.dev") || (adminHost && host === adminHost);

    if (isApiHost) return handleApi(request, env, u);
    return handleProxy(request, env, u, host);
  },
};

// ---------------------------------------------------------------------------
// KV helpers — one record per domain, plus a slug→domain reverse index.
// ---------------------------------------------------------------------------

async function getMapping(env, domain) {
  const raw = await env.DOMAINS.get(`domain:${domain}`);
  return raw ? JSON.parse(raw) : null;
}

async function putMapping(env, record) {
  await env.DOMAINS.put(`domain:${record.domain}`, JSON.stringify(record));
  if (record.storeSlug) await env.DOMAINS.put(`slug:${record.storeSlug}`, record.domain);
}

async function deleteMapping(env, record) {
  await env.DOMAINS.delete(`domain:${record.domain}`);
  if (record.storeSlug) await env.DOMAINS.delete(`slug:${record.storeSlug}`);
}

async function domainForSlug(env, slug) {
  const domain = await env.DOMAINS.get(`slug:${slug}`);
  if (!domain) return null;
  return getMapping(env, domain);
}

// ---------------------------------------------------------------------------
// Cloudflare for SaaS custom-hostname API.
// ---------------------------------------------------------------------------

function cfHeaders(env) {
  return { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, "Content-Type": "application/json" };
}
function cfBase(env) {
  return `https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/custom_hostnames`;
}

async function cfCreateHostname(env, hostname) {
  const res = await fetch(cfBase(env), {
    method: "POST",
    headers: cfHeaders(env),
    body: JSON.stringify({ hostname, ssl: { method: "http", type: "dv", settings: { min_tls_version: "1.2" } } }),
  });
  const body = await res.json();
  if (!body.success) throw new Error((body.errors || []).map((e) => e.message).join("; ") || "Cloudflare error");
  return body.result;
}

async function cfGetHostname(env, id) {
  const res = await fetch(`${cfBase(env)}/${encodeURIComponent(id)}`, { headers: cfHeaders(env) });
  if (res.status === 404) return null;
  const body = await res.json();
  if (!body.success) throw new Error((body.errors || []).map((e) => e.message).join("; ") || "Cloudflare error");
  return body.result;
}

async function cfDeleteHostname(env, id) {
  const res = await fetch(`${cfBase(env)}/${encodeURIComponent(id)}`, { method: "DELETE", headers: cfHeaders(env) });
  if (res.status === 404) return;
  const body = await res.json().catch(() => ({}));
  if (body && body.success === false) throw new Error((body.errors || []).map((e) => e.message).join("; "));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cleanHost(h) {
  return (h || "").toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, "").trim();
}
function sanitizeDomain(input) {
  const d = cleanHost(input);
  if (!d || !/^[a-z0-9.-]+$/.test(d)) return null;
  return d;
}
function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id",
      ...extra,
    },
  });
}
function escapeHtml(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// The DNS records a customer must add, from Cloudflare's custom-hostname object.
function buildDnsRecords(domain, cfHostname, env) {
  const isRoot = domain.split(".").length === 2;
  const records = [
    { type: "CNAME", name: isRoot ? "@" : domain.split(".")[0], value: env.CF_CNAME_TARGET, purpose: "routing" },
  ];
  const ov = cfHostname && cfHostname.ownership_verification;
  if (ov && ov.type === "txt" && ov.name && ov.value) {
    records.push({ type: "TXT", name: ov.name, value: ov.value, purpose: "ownership" });
  }
  const dcv = cfHostname && cfHostname.ssl && cfHostname.ssl.validation_records;
  if (Array.isArray(dcv)) {
    for (const r of dcv) if (r.txt_name && r.txt_value) records.push({ type: "TXT", name: r.txt_name, value: r.txt_value, purpose: "ssl" });
  }
  return records;
}

// ---------------------------------------------------------------------------
// API surface (admin + public), served on the Worker's own host.
// ---------------------------------------------------------------------------

async function handleApi(request, env, u) {
  if (request.method === "OPTIONS") return json({}, 204);

  const path = u.pathname;

  if (path === "/health") return json({ ok: true });

  // Public: which custom domain (if any) is active for a store slug.
  if (path === "/api/domain-for-store" && request.method === "GET") {
    const slug = (u.searchParams.get("slug") || "").toLowerCase().trim();
    if (!slug) return json({ customDomain: null, redirectEnabled: false });
    const rec = await domainForSlug(env, slug);
    if (!rec || !rec.isActive) return json({ customDomain: null, redirectEnabled: false });
    return json({ customDomain: rec.domain, redirectEnabled: rec.redirectEnabled !== false });
  }

  // Everything under /api/admin requires the bearer secret.
  if (path.startsWith("/api/admin/")) {
    const auth = request.headers.get("authorization") || "";
    const token = (auth.match(/^Bearer\s+(.+)$/i) || [])[1];
    if (!token || token !== env.VERIFICATION_SECRET) {
      return json({ error: "Missing or invalid Authorization bearer token." }, 401);
    }
    const body = request.method === "POST" ? await request.json().catch(() => ({})) : {};
    const authUserId = (body && body.userId) || request.headers.get("x-user-id") || null;

    // POST /api/admin/domains — register a domain on Cloudflare.
    if (path === "/api/admin/domains" && request.method === "POST") {
      const domain = sanitizeDomain(body.domain);
      if (!domain) return json({ error: "A valid domain is required." }, 400);
      if (!body.storeSlug) return json({ error: "storeSlug is required." }, 400);

      const existing = await getMapping(env, domain);
      if (existing && existing.ownerUserId && authUserId && existing.ownerUserId !== authUserId) {
        return json({ error: "This domain is already connected to another store." }, 403);
      }

      let cfHostname;
      try {
        cfHostname = await cfCreateHostname(env, domain);
      } catch (err) {
        return json({ error: "Could not register the domain with Cloudflare." }, 502);
      }

      const now = new Date().toISOString();
      const record = {
        domain,
        storeSlug: body.storeSlug,
        marketplaceId: body.marketplaceId || null,
        ownerUserId: authUserId,
        cfHostnameId: cfHostname.id || null,
        verificationStatus: "pending",
        sslStatus: "pending",
        isActive: false,
        redirectEnabled: existing ? existing.redirectEnabled !== false : true,
        createdAt: existing ? existing.createdAt : now,
        verifiedAt: existing ? existing.verifiedAt : null,
        updatedAt: now,
      };
      await putMapping(env, record);
      return json({ domain, dns: { records: buildDnsRecords(domain, cfHostname, env) } });
    }

    // Routes with a :domain segment.
    const m = path.match(/^\/api\/admin\/domains\/([^/]+)(\/verify)?$/);
    if (m) {
      const domain = sanitizeDomain(decodeURIComponent(m[1]));
      if (!domain) return json({ error: "Invalid domain." }, 400);
      const rec = await getMapping(env, domain);
      if (!rec) return json({ error: "Domain mapping not found." }, 404);
      if (authUserId && rec.ownerUserId && rec.ownerUserId !== authUserId) {
        return json({ error: "You do not own this domain mapping." }, 403);
      }

      // POST /verify — read Cloudflare status.
      if (m[2] && request.method === "POST") {
        if (!rec.cfHostnameId) return json({ error: "Domain is not registered. Re-connect it first." }, 400);
        let cfHostname;
        try {
          cfHostname = await cfGetHostname(env, rec.cfHostnameId);
        } catch (err) {
          return json({ error: "Could not check domain status with Cloudflare." }, 502);
        }
        if (!cfHostname) return json({ error: "Domain not found at Cloudflare." }, 404);
        const sslActive = cfHostname.ssl && cfHostname.ssl.status === "active";
        const verified = cfHostname.status === "active" && sslActive;
        rec.verificationStatus = verified ? "verified" : "failed";
        rec.sslStatus = sslActive ? "active" : "pending";
        rec.isActive = verified;
        rec.updatedAt = new Date().toISOString();
        if (verified) rec.verifiedAt = new Date().toISOString();
        await putMapping(env, rec);
        return json({
          verified,
          verificationStatus: rec.verificationStatus,
          sslStatus: rec.sslStatus,
          dns: { records: buildDnsRecords(domain, cfHostname, env) },
          message: verified
            ? "Domain verified and SSL activated."
            : "Not verified yet. Add the DNS record(s) below and allow a few minutes for Cloudflare to validate (up to 48h for DNS).",
        });
      }

      // GET — current state + fresh DNS records.
      if (!m[2] && request.method === "GET") {
        let records;
        if (rec.cfHostnameId) {
          try {
            const cfHostname = await cfGetHostname(env, rec.cfHostnameId);
            if (cfHostname) records = buildDnsRecords(domain, cfHostname, env);
          } catch (_) {}
        }
        return json({
          domain: rec.domain,
          storeSlug: rec.storeSlug,
          verificationStatus: rec.verificationStatus,
          sslStatus: rec.sslStatus,
          isActive: !!rec.isActive,
          redirectEnabled: rec.redirectEnabled !== false,
          createdAt: rec.createdAt,
          verifiedAt: rec.verifiedAt,
          dns: { records: records || buildDnsRecords(domain, null, env) },
        });
      }

      // DELETE — remove from Cloudflare + KV.
      if (!m[2] && request.method === "DELETE") {
        if (rec.cfHostnameId) {
          try { await cfDeleteHostname(env, rec.cfHostnameId); } catch (_) {}
        }
        await deleteMapping(env, rec);
        return json({ ok: true });
      }
    }
  }

  return json({ error: "Not found" }, 404);
}

// ---------------------------------------------------------------------------
// Custom-domain reverse proxy + SEO rewrite.
// ---------------------------------------------------------------------------

async function handleProxy(request, env, u, host) {
  const rec = await getMapping(env, host);
  if (!rec) {
    return new Response("This domain is not configured.", { status: 404, headers: { "Content-Type": "text/plain" } });
  }

  // Fetch the same path from the Base44 app.
  const upstream = new URL(u.pathname + u.search, env.UPSTREAM_ORIGIN);
  const headers = new Headers(request.headers);
  headers.delete("host"); // let fetch set Host from the upstream URL
  const upstreamReq = new Request(upstream.toString(), {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });

  let resp = await fetch(upstreamReq);

  const ct = resp.headers.get("content-type") || "";
  if (!ct.includes("text/html")) return resp;

  // Rewrite SEO tags in the HTML shell using the store's public data. Fail open.
  try {
    const meta = await fetchMarketplaceMeta(env, host);
    if (!meta) return resp;
    const canonical = `https://${host}/`;
    const metaTags =
      `<meta name="description" content="${escapeHtml(meta.desc)}">` +
      `<link rel="canonical" href="${escapeHtml(canonical)}">` +
      `<meta property="og:title" content="${escapeHtml(meta.title)}">` +
      `<meta property="og:description" content="${escapeHtml(meta.desc)}">` +
      `<meta property="og:url" content="${escapeHtml(canonical)}">` +
      (meta.logo ? `<meta property="og:image" content="${escapeHtml(meta.logo)}">` : "");
    return new HTMLRewriter()
      .on("title", { element(el) { el.setInnerContent(meta.title); } })
      .on("head", { element(el) { el.append(metaTags, { html: true }); } })
      .transform(resp);
  } catch (_) {
    return resp;
  }
}

async function fetchMarketplaceMeta(env, customDomain) {
  const res = await fetch(`${env.BASE44_FUNCTIONS_ORIGIN}/functions/getMarketplacePublic`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customDomain }),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  const mp = data && data.marketplace;
  if (!mp) return null;
  return {
    title: mp.name || "Store",
    desc: (mp.settings && mp.settings.seoDescription) || mp.description || "",
    logo: (mp.branding && mp.branding.logo) || "",
  };
}
