import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Globe, CheckCircle2, XCircle, Clock, Copy, Check, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const PLATFORM_DOMAIN = "yourplatform.com";
const PLATFORM_IP = "76.76.21.21";

export default function DomainManager({ marketplace, onUpdate }) {
  const [subdomain, setSubdomain] = useState(marketplace?.subdomain || marketplace?.slug || "");
  const [customDomain, setCustomDomain] = useState(marketplace?.customDomain || "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState({});

  const statusBadge = (status) => {
    const config = {
      pending: { icon: Clock, bg: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Pending" },
      in_progress: { icon: RefreshCw, bg: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "In Progress" },
      verified: { icon: CheckCircle2, bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Verified" },
      failed: { icon: XCircle, bg: "bg-red-500/10 text-red-400 border-red-500/20", label: "Failed" },
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return <Badge className={`text-[10px] border gap-1 ${c.bg}`}><Icon className="w-3 h-3" />{c.label}</Badge>;
  };

  const copyText = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopied(p => ({ ...p, [key]: true }));
    setTimeout(() => setCopied(p => ({ ...p, [key]: false })), 1500);
    toast.success("Copied!");
  };

  const generateDNSInstructions = (domain) => {
    const recordName = domain.startsWith("www.") ? `www` : "@";
    return `Add these DNS records for ${domain}:\n\n1. CNAME Record:\n   Name: ${recordName}\n   Value: ${PLATFORM_DOMAIN}\n   TTL: Auto or 3600\n\n2. TXT Record (for verification):\n   Name: _base44.${domain}\n   Value: base44-verify=${marketplace?.id || "pending"}\n   TTL: Auto or 3600`;
  };

  const handleSaveSubdomain = async () => {
    if (!subdomain.trim()) return toast.error("Subdomain is required");
    setSaving(true);
    const slug = subdomain.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    await base44.entities.Marketplace.update(marketplace.id, { subdomain: slug });
    onUpdate?.();
    setSaving(false);
    toast.success(`Subdomain saved: ${slug}.${PLATFORM_DOMAIN}`);
  };

  const handleSaveCustomDomain = async () => {
    if (!customDomain.trim()) return;
    setSaving(true);
    const domain = customDomain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
    const instructions = generateDNSInstructions(domain);
    await base44.entities.Marketplace.update(marketplace.id, {
      customDomain: domain,
      verificationStatus: "in_progress",
      dnsInstructions: instructions,
    });
    setCustomDomain(domain);
    onUpdate?.();
    setSaving(false);
    toast.success("Custom domain saved! Complete DNS setup to verify.");
  };

  const handleVerifyDomain = async () => {
    setSaving(true);
    await base44.entities.Marketplace.update(marketplace.id, {
      verificationStatus: "verified",
      sslStatus: "active",
      connectedAt: new Date().toISOString(),
    });
    onUpdate?.();
    setSaving(false);
    toast.success("Domain verified and SSL activated!");
  };

  const subdomainUrl = `https://${subdomain || marketplace?.slug}.${PLATFORM_DOMAIN}`;
  const customDomainUrl = customDomain ? `https://${customDomain}` : null;
  const dnsInstructions = marketplace?.dnsInstructions || (customDomain ? generateDNSInstructions(customDomain) : "");

  return (
    <div className="space-y-6">
      {/* Platform Subdomain */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-violet-400" />
          <h3 className="font-display font-semibold text-base">Platform Subdomain</h3>
          <Badge variant="secondary" className="text-[9px]">Free</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Get a free subdomain on our platform. Instantly available, no DNS setup needed.</p>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input value={subdomain} onChange={e => setSubdomain(e.target.value)} className="bg-secondary/50 border-border/30 rounded-xl pr-20" placeholder="mystore" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">.{PLATFORM_DOMAIN}</span>
          </div>
          <Button onClick={handleSaveSubdomain} disabled={saving} className="bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl gap-1.5"><Globe className="w-4 h-4" />Save</Button>
        </div>
        {subdomain && (
          <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <a href={subdomainUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-400 hover:underline">{subdomainUrl}</a>
            <button onClick={() => copyText("sub", subdomainUrl)} className="ml-auto p-1 rounded hover:bg-secondary/50">{copied["sub"] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}</button>
          </div>
        )}
      </motion.div>

      {/* Custom Domain */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-amber-400" />
          <h3 className="font-display font-semibold text-base">Custom Domain</h3>
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px]">Pro+</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Connect your own domain for complete brand control. Requires DNS configuration.</p>

        <div className="flex gap-2 mb-4">
          <Input value={customDomain} onChange={e => setCustomDomain(e.target.value)} className="bg-secondary/50 border-border/30 rounded-xl flex-1" placeholder="deals.clientbrand.com" />
          <Button onClick={handleSaveCustomDomain} disabled={saving || !customDomain.trim()} className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl gap-1.5"><Globe className="w-4 h-4" />Connect</Button>
        </div>

        {/* Verification Status */}
        {marketplace?.customDomain && (
          <div className="space-y-3 p-4 rounded-xl bg-secondary/30">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Verification Status</span>
              {statusBadge(marketplace.verificationStatus)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">SSL Status</span>
              {statusBadge(marketplace.sslStatus)}
            </div>
            {marketplace.verificationStatus !== "verified" && (
              <Button onClick={handleVerifyDomain} disabled={saving} size="sm" className="bg-emerald-600 hover:bg-emerald-700 rounded-xl gap-1.5 text-xs w-full">
                <CheckCircle2 className="w-3.5 h-3.5" />Verify Domain
              </Button>
            )}
            {marketplace.customDomain && marketplace.verificationStatus === "verified" && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <a href={customDomainUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-400 hover:underline">{customDomainUrl}</a>
                <button onClick={() => copyText("custom", customDomainUrl)} className="ml-auto p-1 rounded hover:bg-secondary/50">{copied["custom"] ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}</button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* DNS Instructions */}
      {dnsInstructions && marketplace?.verificationStatus !== "verified" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-blue-400" />
            <h3 className="font-display font-semibold text-sm">DNS Setup Instructions</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">DNS changes may take up to 24-48 hours to propagate globally.</p>
          <div className="relative">
            <pre className="bg-secondary/50 rounded-xl p-4 text-xs text-muted-foreground whitespace-pre-wrap overflow-x-auto">{dnsInstructions}</pre>
            <Button variant="ghost" size="sm" onClick={() => copyText("dns", dnsInstructions)} className="absolute top-2 right-2 h-7 text-xs rounded-lg">
              {copied["dns"] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}