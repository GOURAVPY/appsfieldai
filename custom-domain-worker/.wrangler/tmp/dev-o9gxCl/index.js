var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/utils/responses.js
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id"
};
function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS, ...extraHeaders }
  });
}
__name(json, "json");
function errorJson(message, status = 400, extra = {}) {
  return json({ success: false, error: message, ...extra }, status);
}
__name(errorJson, "errorJson");
function textResponse(message, status = 200) {
  return new Response(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
__name(textResponse, "textResponse");

// src/utils/validation.js
function normalizeHostname(input) {
  return (input || "").toString().trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, "").replace(/\.$/, "").trim();
}
__name(normalizeHostname, "normalizeHostname");
function isValidHostname(hostname) {
  if (!hostname || hostname.length > 253)
    return false;
  if (!/^[a-z0-9.-]+$/.test(hostname))
    return false;
  const labels = hostname.split(".");
  if (labels.length < 2)
    return false;
  return labels.every(
    (l) => l.length >= 1 && l.length <= 63 && !l.startsWith("-") && !l.endsWith("-")
  );
}
__name(isValidHostname, "isValidHostname");
function isInternalDomain(hostname, env) {
  const internal = ["appsfieldai.com", "onrender.com", "base44.app", "base44.dev", "workers.dev"];
  const cname = normalizeHostname(env && env.CNAME_TARGET);
  if (cname && (hostname === cname || hostname.endsWith(`.${cname}`)))
    return true;
  return internal.some((d) => hostname === d || hostname.endsWith(`.${d}`));
}
__name(isInternalDomain, "isInternalDomain");

// src/services/domainStore.js
async function getDomain(env, hostname) {
  const raw = await env.DOMAINS.get(hostname);
  return raw ? JSON.parse(raw) : null;
}
__name(getDomain, "getDomain");
async function putDomain(env, hostname, data) {
  await env.DOMAINS.put(hostname, JSON.stringify(data));
  if (data.storeSlug)
    await env.DOMAINS.put(`slug:${data.storeSlug}`, hostname);
}
__name(putDomain, "putDomain");
async function deleteDomain(env, hostname) {
  const existing = await getDomain(env, hostname);
  await env.DOMAINS.delete(hostname);
  if (existing && existing.storeSlug)
    await env.DOMAINS.delete(`slug:${existing.storeSlug}`);
}
__name(deleteDomain, "deleteDomain");
async function domainForSlug(env, slug) {
  const hostname = await env.DOMAINS.get(`slug:${slug}`);
  if (!hostname)
    return null;
  return getDomain(env, hostname);
}
__name(domainForSlug, "domainForSlug");

// src/services/cloudflareCustomHostnames.js
function base(env) {
  return `https://api.cloudflare.com/client/v4/zones/${env.ZONE_ID}/custom_hostnames`;
}
__name(base, "base");
function headers(env) {
  return { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, "Content-Type": "application/json" };
}
__name(headers, "headers");
function firstError(body) {
  if (body && Array.isArray(body.errors) && body.errors.length) {
    const e = body.errors[0];
    return `${e.message || "Cloudflare error"}${e.code ? ` (code ${e.code})` : ""}`;
  }
  return "Cloudflare API error";
}
__name(firstError, "firstError");
async function createCustomHostname(env, hostname, _tenantId) {
  try {
    const res = await fetch(base(env), {
      method: "POST",
      headers: headers(env),
      body: JSON.stringify({
        hostname,
        ssl: { method: "http", type: "dv", settings: { min_tls_version: "1.2" } }
      })
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.success)
      return { ok: false, status: res.status, error: firstError(body) };
    return { ok: true, result: body.result };
  } catch (err) {
    return { ok: false, error: `Network error contacting Cloudflare: ${err.message}` };
  }
}
__name(createCustomHostname, "createCustomHostname");
async function getCustomHostname(env, customHostnameId) {
  try {
    const res = await fetch(`${base(env)}/${encodeURIComponent(customHostnameId)}`, { headers: headers(env) });
    if (res.status === 404)
      return { ok: true, result: null };
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.success)
      return { ok: false, status: res.status, error: firstError(body) };
    return { ok: true, result: body.result };
  } catch (err) {
    return { ok: false, error: `Network error contacting Cloudflare: ${err.message}` };
  }
}
__name(getCustomHostname, "getCustomHostname");
async function deleteCustomHostname(env, customHostnameId) {
  try {
    const res = await fetch(`${base(env)}/${encodeURIComponent(customHostnameId)}`, {
      method: "DELETE",
      headers: headers(env)
    });
    if (res.status === 404)
      return { ok: true };
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body && body.success === false)
      return { ok: false, status: res.status, error: firstError(body) };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: `Network error contacting Cloudflare: ${err.message}` };
  }
}
__name(deleteCustomHostname, "deleteCustomHostname");
function summarizeStatus(cfHostname) {
  const sslStatus = cfHostname && cfHostname.ssl && cfHostname.ssl.status || "unknown";
  const cloudflareStatus = cfHostname && cfHostname.status || "unknown";
  const active = cloudflareStatus === "active" && sslStatus === "active";
  return { active, sslStatus, cloudflareStatus };
}
__name(summarizeStatus, "summarizeStatus");
function buildDnsInstructions(hostname, cfHostname, env) {
  const label = hostname.split(".").length === 2 ? "@" : hostname.split(".")[0];
  const records = [
    { type: "CNAME", name: label, target: env.CNAME_TARGET, purpose: "routing" }
  ];
  const ov = cfHostname && cfHostname.ownership_verification;
  if (ov && ov.type === "txt" && ov.name && ov.value) {
    records.push({ type: "TXT", name: ov.name, target: ov.value, purpose: "ownership" });
  }
  const dcv = cfHostname && cfHostname.ssl && cfHostname.ssl.validation_records;
  if (Array.isArray(dcv)) {
    for (const r of dcv)
      if (r.txt_name && r.txt_value)
        records.push({ type: "TXT", name: r.txt_name, target: r.txt_value, purpose: "ssl" });
  }
  return { primary: records[0], records };
}
__name(buildDnsInstructions, "buildDnsInstructions");

// src/routes/domainApi.js
function requireAuth(request, env) {
  const auth = request.headers.get("authorization") || "";
  const token = (auth.match(/^Bearer\s+(.+)$/i) || [])[1];
  if (!token || token !== env.VERIFICATION_SECRET) {
    return errorJson("Unauthorized", 401);
  }
  return null;
}
__name(requireAuth, "requireAuth");
async function handleRegister(request, env) {
  const unauth = requireAuth(request, env);
  if (unauth)
    return unauth;
  const body = await request.json().catch(() => ({}));
  const hostname = normalizeHostname(body.hostname);
  const tenantId = (body.tenantId || "").toString().trim();
  const originType = (body.originType || "app").toString().trim();
  const storeSlug = body.storeSlug ? body.storeSlug.toString().trim() : null;
  if (!hostname)
    return errorJson("hostname is required", 400);
  if (!tenantId)
    return errorJson("tenantId is required", 400);
  if (!isValidHostname(hostname))
    return errorJson("Invalid hostname", 400);
  if (isInternalDomain(hostname, env))
    return errorJson("This domain cannot be used", 400);
  const existing = await getDomain(env, hostname);
  if (existing) {
    if (existing.tenantId && existing.tenantId !== tenantId) {
      return errorJson("This domain is already connected to another tenant", 409);
    }
  }
  const cf = await createCustomHostname(env, hostname, tenantId);
  if (!cf.ok) {
    const status = cf.status === 403 ? 403 : 400;
    return errorJson(`Cloudflare: ${cf.error}`, status);
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const record = {
    tenantId,
    hostname,
    status: "pending",
    originType: originType === "base44" ? "base44" : "app",
    storeSlug,
    cloudflareCustomHostnameId: cf.result.id,
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now
  };
  await putDomain(env, hostname, record);
  const dns = buildDnsInstructions(hostname, cf.result, env);
  return json({
    success: true,
    hostname,
    status: "pending",
    cnameTarget: env.CNAME_TARGET,
    dnsInstructions: dns.primary,
    dnsRecords: dns.records
  });
}
__name(handleRegister, "handleRegister");
async function handleStatus(request, env, url) {
  const unauth = requireAuth(request, env);
  if (unauth)
    return unauth;
  const hostname = normalizeHostname(url.searchParams.get("hostname"));
  if (!hostname)
    return errorJson("hostname is required", 400);
  const record = await getDomain(env, hostname);
  if (!record)
    return errorJson("Domain not found", 404);
  if (!record.cloudflareCustomHostnameId) {
    return errorJson("Domain has no Cloudflare hostname id. Re-register it.", 400);
  }
  const cf = await getCustomHostname(env, record.cloudflareCustomHostnameId);
  if (!cf.ok)
    return errorJson(`Cloudflare: ${cf.error}`, 502);
  if (!cf.result) {
    record.status = "deleted";
    record.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    await putDomain(env, hostname, record);
    return json({ success: true, hostname, status: "deleted" });
  }
  const { active, sslStatus, cloudflareStatus } = summarizeStatus(cf.result);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (active && record.status !== "active") {
    record.status = "active";
    record.activatedAt = now;
  } else if (!active && record.status === "active") {
    record.status = "pending";
  } else if (!active && record.status !== "active") {
    record.status = "pending";
  }
  record.updatedAt = now;
  await putDomain(env, hostname, record);
  const dns = buildDnsInstructions(hostname, cf.result, env);
  return json({
    success: true,
    hostname,
    status: record.status,
    sslStatus,
    cloudflareStatus,
    dnsInstructions: dns.primary,
    dnsRecords: dns.records
  });
}
__name(handleStatus, "handleStatus");
async function handleDelete(request, env, url) {
  const unauth = requireAuth(request, env);
  if (unauth)
    return unauth;
  const hostname = normalizeHostname(url.searchParams.get("hostname"));
  if (!hostname)
    return errorJson("hostname is required", 400);
  const record = await getDomain(env, hostname);
  if (!record)
    return errorJson("Domain not found", 404);
  if (record.cloudflareCustomHostnameId) {
    const cf = await deleteCustomHostname(env, record.cloudflareCustomHostnameId);
    if (!cf.ok)
      console.log("Cloudflare delete failed:", cf.error);
  }
  await deleteDomain(env, hostname);
  return json({ success: true, hostname, status: "deleted" });
}
__name(handleDelete, "handleDelete");
async function handleDomainForStore(env, url) {
  const slug = (url.searchParams.get("slug") || "").toLowerCase().trim();
  if (!slug)
    return json({ customDomain: null, redirectEnabled: false });
  const record = await domainForSlug(env, slug);
  if (!record || record.status !== "active")
    return json({ customDomain: null, redirectEnabled: false });
  return json({ customDomain: record.hostname, redirectEnabled: record.redirectEnabled !== false });
}
__name(handleDomainForStore, "handleDomainForStore");

// src/services/proxy.js
function pickOrigin(env, record, url, hostname) {
  if (hostname === "admin.appsfieldai.com")
    return env.ADMIN_ORIGIN;
  if (url.pathname.startsWith("/functions") || url.pathname.startsWith("/base44"))
    return env.BASE44_ORIGIN;
  if (record && record.originType === "base44")
    return env.BASE44_ORIGIN;
  if (record && record.originType === "app")
    return env.APP_ORIGIN;
  return env.APP_ORIGIN;
}
__name(pickOrigin, "pickOrigin");
async function proxyToOrigin(request, origin, extraHeaders = {}) {
  const originUrl = new URL(origin);
  const target = new URL(request.url);
  target.protocol = originUrl.protocol;
  target.hostname = originUrl.hostname;
  target.port = originUrl.port;
  const headers2 = new Headers(request.headers);
  headers2.set("host", originUrl.host);
  for (const [k, v] of Object.entries(extraHeaders))
    headers2.set(k, v);
  const init = {
    method: request.method,
    headers: headers2,
    redirect: "manual",
    body: request.method === "GET" || request.method === "HEAD" ? void 0 : request.body
  };
  return fetch(new Request(target.toString(), init));
}
__name(proxyToOrigin, "proxyToOrigin");
async function handlePublicRequest(request, env, url, hostname) {
  let record;
  try {
    record = await getDomain(env, hostname);
  } catch (err) {
    return textResponse("Temporary error resolving this domain. Please try again.", 503);
  }
  if (!record) {
    return textResponse("Domain not found in AppsfieldAI.", 404);
  }
  if (record.status === "pending") {
    return textResponse("Domain is still being verified. Please check your DNS and SSL status.", 409);
  }
  if (record.status === "failed") {
    return textResponse("Domain verification failed. Please reconnect your domain.", 409);
  }
  const origin = pickOrigin(env, record, url, hostname);
  const extraHeaders = {
    "x-tenant-id": record.tenantId || "",
    "x-original-host": hostname,
    "x-origin-type": record.originType || "app",
    "x-appsfield-proxy-secret": env.ORIGIN_PROXY_SECRET || ""
  };
  try {
    return await proxyToOrigin(request, origin, extraHeaders);
  } catch (err) {
    return textResponse("Upstream error serving this storefront.", 502);
  }
}
__name(handlePublicRequest, "handlePublicRequest");

// src/routes/adminCompat.js
function requireAuth2(request, env) {
  const auth = request.headers.get("authorization") || "";
  const token = (auth.match(/^Bearer\s+(.+)$/i) || [])[1];
  return token && token === env.VERIFICATION_SECRET;
}
__name(requireAuth2, "requireAuth");
function dnsRecord(hostname, env) {
  const isRoot = hostname.split(".").length === 2;
  return { type: isRoot ? "A" : "CNAME", name: isRoot ? "@" : hostname.split(".")[0], target: env.CNAME_TARGET };
}
__name(dnsRecord, "dnsRecord");
function appStatus(cfHostname) {
  const { active, sslStatus } = summarizeStatus(cfHostname);
  return {
    verificationStatus: active ? "verified" : "pending",
    sslStatus: sslStatus === "active" ? "active" : "pending"
  };
}
__name(appStatus, "appStatus");
async function handleAdminCompat(request, env, url) {
  if (!url.pathname.startsWith("/api/admin/domains"))
    return null;
  if (!requireAuth2(request, env))
    return errorJson("Unauthorized", 401);
  const method = request.method;
  if (url.pathname === "/api/admin/domains" && method === "POST") {
    const body = await request.json().catch(() => ({}));
    const hostname = normalizeHostname(body.domain);
    if (!hostname || !isValidHostname(hostname))
      return errorJson("A valid domain is required", 400);
    if (isInternalDomain(hostname, env))
      return errorJson("This domain cannot be used", 400);
    const existing = await getDomain(env, hostname);
    if (existing && existing.ownerUserId && body.userId && existing.ownerUserId !== body.userId) {
      return errorJson("This domain is already connected to another store", 409);
    }
    const cf = await createCustomHostname(env, hostname, body.marketplaceId);
    if (!cf.ok)
      return errorJson(`Cloudflare: ${cf.error}`, cf.status === 403 ? 403 : 400);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await putDomain(env, hostname, {
      domain: hostname,
      tenantId: body.marketplaceId || null,
      marketplaceId: body.marketplaceId || null,
      ownerUserId: body.userId || null,
      storeSlug: body.storeSlug || null,
      originType: "app",
      status: "pending",
      cloudflareCustomHostnameId: cf.result.id,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now
    });
    return json({ verificationStatus: "pending", sslStatus: "pending", dns: dnsRecord(hostname, env) });
  }
  const m = url.pathname.match(/^\/api\/admin\/domains\/([^/]+)(\/verify)?$/);
  if (m) {
    const hostname = normalizeHostname(decodeURIComponent(m[1]));
    const rec = await getDomain(env, hostname);
    if (!rec)
      return errorJson("Domain not found", 404);
    if (!m[2] && method === "DELETE") {
      if (rec.cloudflareCustomHostnameId) {
        try {
          await deleteCustomHostname(env, rec.cloudflareCustomHostnameId);
        } catch (_) {
        }
      }
      await deleteDomain(env, hostname);
      return json({ ok: true });
    }
    const isVerify = !!m[2];
    if (isVerify && method === "POST" || !isVerify && method === "GET") {
      let cfHostname = null;
      if (rec.cloudflareCustomHostnameId) {
        const cf = await getCustomHostname(env, rec.cloudflareCustomHostnameId);
        if (cf.ok)
          cfHostname = cf.result;
      }
      const st = appStatus(cfHostname);
      rec.status = st.verificationStatus === "verified" ? "active" : "pending";
      rec.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      if (st.verificationStatus === "verified" && !rec.activatedAt)
        rec.activatedAt = rec.updatedAt;
      await putDomain(env, hostname, rec);
      const verified = st.verificationStatus === "verified";
      return json({
        ...st,
        dns: dnsRecord(hostname, env),
        verified,
        message: verified ? "Domain verified and SSL activated." : "Not verified yet. Add the DNS record below and allow a few minutes for Cloudflare to validate (up to 48h for DNS)."
      });
    }
  }
  return errorJson("Not found", 404);
}
__name(handleAdminCompat, "handleAdminCompat");

// src/index.js
var DEFAULT_PLATFORM_HOSTS = "app.appsfieldai.com,appsfieldai.com,www.appsfieldai.com";
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const hostname = normalizeHostname(request.headers.get("host") || url.hostname);
    const path = url.pathname;
    if (request.method === "OPTIONS" && path.startsWith("/api/")) {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (path === "/health")
      return json({ ok: true });
    if (path === "/api/custom-domains/register" && request.method === "POST") {
      return handleRegister(request, env);
    }
    if (path === "/api/custom-domains/status" && request.method === "GET") {
      return handleStatus(request, env, url);
    }
    if (path === "/api/custom-domains" && request.method === "DELETE") {
      return handleDelete(request, env, url);
    }
    if (path === "/api/domain-for-store" && request.method === "GET") {
      return handleDomainForStore(env, url);
    }
    if (path.startsWith("/api/admin/domains")) {
      const resp = await handleAdminCompat(request, env, url);
      if (resp)
        return resp;
    }
    if (path.startsWith("/api/custom-domains")) {
      return errorJson("Not found", 404);
    }
    const platformHosts = (env.PLATFORM_HOSTS || DEFAULT_PLATFORM_HOSTS).split(",").map((h) => normalizeHostname(h));
    if (platformHosts.includes(hostname)) {
      return proxyToOrigin(request, env.BASE44_ORIGIN);
    }
    return handlePublicRequest(request, env, url, hostname);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// .wrangler/tmp/bundle-jkaMVM/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-jkaMVM/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
