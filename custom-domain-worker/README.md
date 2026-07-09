# Custom Domain Worker

A single **Cloudflare Worker** that gives AppsfieldAI store owners custom domains
(e.g. `deals.yourbrand.com`) with **unlimited hostnames + automatic SSL**, on
Cloudflare's **free tier** (100K requests/day). No separate server, no Fly, no
Render — the Worker *is* the whole backend.

## What it does

- **On its own API host** (the `*.workers.dev` URL, or a custom `ADMIN_HOST`):
  serves the admin API (`/api/admin/domains` add/verify/remove) that the Base44
  `DomainManager.jsx` calls, plus the public `/api/domain-for-store` lookup.
- **On every customer custom hostname** (caught by the `*/*` route): reverse-proxies
  the request to the Base44 app (`UPSTREAM_ORIGIN`) and injects SEO `<title>` /
  canonical / OG tags with `HTMLRewriter`.

Custom domains are registered with **Cloudflare for SaaS** (custom hostnames), so
Cloudflare validates ownership and issues/renews the TLS cert. Mappings are stored
in **Cloudflare KV**.

```
Customer domain (deals.brand.com)
   │  CNAME → CF_CNAME_TARGET (custom.appsfieldai.com, in your CF zone)
   ▼
Cloudflare edge (Custom Hostname: cert + validation)
   │  `*/*` route on the zone catches the traffic
   ▼
THIS Worker — KV lookup → fetch UPSTREAM_ORIGIN → HTMLRewriter SEO
   ▼
Base44 app (https://app.appsfieldai.com) — renders the store
```

## One-time setup

### 1. Cloudflare for SaaS (appsfieldai.com zone)
- SSL/TLS → **Custom Hostnames** → enable.
- Create a **proxied** DNS record `custom.appsfieldai.com` (the `CF_CNAME_TARGET`)
  and set it as the **Fallback Origin**. (A dummy A record like `192.0.2.1` proxied
  is fine — the Worker intercepts before it's used.)
- Create an **API token** scoped to the zone: `SSL and Certificates: Edit` + `Zone: Read`.
- Note the **Zone ID** (Overview page).

### 2. Install + configure Wrangler
```bash
cd custom-domain-worker
npm install
npx wrangler login
```

### 3. Create the KV namespace
```bash
npx wrangler kv namespace create DOMAINS
```
Paste the returned `id` into `wrangler.toml` under `[[kv_namespaces]]`.

### 4. Fill `wrangler.toml`
Set `CLOUDFLARE_ZONE_ID`, confirm `UPSTREAM_ORIGIN`, `BASE44_FUNCTIONS_ORIGIN`,
`CF_CNAME_TARGET`. Leave `ADMIN_HOST` empty to use the `*.workers.dev` URL.

### 5. Set secrets
```bash
npx wrangler secret put VERIFICATION_SECRET
npx wrangler secret put CLOUDFLARE_API_TOKEN
```

### 6. Deploy
```bash
npx wrangler deploy
```
This publishes the Worker and (from `wrangler.toml`) attaches the `*/*` route on
`appsfieldai.com`.

### 7. Exclude the main app from proxying (important)
In the dashboard → Workers Routes, add a route **`app.appsfieldai.com/*` → Worker: None**
so the platform app is served normally and never proxied through this Worker.

## Wire up the Base44 app
Point the app at the Worker's API host:
```
VITE_DOMAIN_SERVICE_URL=https://custom-domain-worker.<your-subdomain>.workers.dev
VITE_DOMAIN_SERVICE_SECRET=<same as VERIFICATION_SECRET>
```
(or the hardcoded fallbacks in `DomainManager.jsx` / `StorePage.jsx`).

## Customer flow
1. Owner enters their domain → Connect → Worker registers it on Cloudflare, returns the CNAME.
2. Owner adds the CNAME (→ `custom.appsfieldai.com`) at their DNS provider.
3. Owner clicks Verify → once Cloudflare validates + issues the cert, the store is live on the domain.

## Notes
- **Free tier**: 100K requests/day. A store page load = HTML + assets, all proxied,
  so heavy traffic can add up; Workers paid ($5/mo) lifts this to 10M/day.
- **Apex domains** need CNAME-flattening/ALIAS at the apex; subdomains are a clean CNAME.
- The bearer secret is embedded in client-side JS (inherent to calling from the browser).
