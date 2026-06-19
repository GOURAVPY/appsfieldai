// Detects whether the app is being served from a customer store subdomain
// (e.g. mystore.platform.com via a wildcard DNS record) and returns the store key.
// Returns null when on the main app host (apex, www, base44 infra, localhost, IPs).

const INFRA_LABELS = ["www", "app", "admin", "api", "staging", "preview"];

export function getStoreKeyFromHost(hostname = window.location.hostname) {
  const host = (hostname || "").toLowerCase().trim();
  if (!host) return null;

  // Ignore localhost / IPs / base44 infra hosts — never treat these as a store.
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ||
    host.includes("base44.app") ||
    host.includes("base44.dev")
  ) {
    return null;
  }

  const parts = host.split(".");
  // Need at least sub.domain.tld for a subdomain to exist.
  if (parts.length < 3) return null;

  const label = parts[0];
  if (INFRA_LABELS.includes(label)) return null;

  return label;
}