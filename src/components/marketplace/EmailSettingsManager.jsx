import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Server, Mail } from "lucide-react";
import { toast } from "sonner";

// Template-mail definitions, one tab per transactional action.
const TEMPLATE_TABS = [
  { key: "welcome", label: "Welcome", defaultSubject: "Welcome to {{store_name}}!" },
  { key: "orderConfirmation", label: "Order Confirmation", defaultSubject: "Your order is confirmed" },
  { key: "reservation", label: "Reservation", defaultSubject: "Your spot is reserved" },
];

export default function EmailSettingsManager({ marketplace }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState("smtp"); // "smtp" | "templates"
  const [activeTpl, setActiveTpl] = useState("welcome");

  const es = marketplace?.emailSettings || {};
  const [form, setForm] = useState({
    smtpEnabled: es.smtpEnabled ?? false,
    smtpHost: es.smtpHost || "",
    smtpPort: es.smtpPort ?? 587,
    smtpUsername: es.smtpUsername || "",
    smtpPassword: es.smtpPassword || "",
    smtpSecure: es.smtpSecure ?? true,
    fromName: es.fromName || "",
    fromEmail: es.fromEmail || "",
    templates: {
      welcome: es.templates?.welcome || { enabled: true, subject: "", body: "" },
      orderConfirmation: es.templates?.orderConfirmation || { enabled: true, subject: "", body: "" },
      reservation: es.templates?.reservation || { enabled: true, subject: "", body: "" },
    },
  });

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const setTpl = (key, field, value) =>
    setForm(f => ({ ...f, templates: { ...f.templates, [key]: { ...f.templates[key], [field]: value } } }));

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Marketplace.update(marketplace.id, { emailSettings: form });
    queryClient.invalidateQueries({ queryKey: ["ownerMarketplaces"] });
    toast.success("Email settings saved!");
    setSaving(false);
  };

  const tpl = form.templates[activeTpl];
  const tplMeta = TEMPLATE_TABS.find(t => t.key === activeTpl);

  return (
    <div className="space-y-4">
      {/* Section switch */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary/40 w-fit">
        {[{ id: "smtp", label: "SMTP Server", icon: Server }, { id: "templates", label: "Email Templates", icon: Mail }].map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${section === s.id ? "bg-orange-500/20 text-orange-400" : "text-muted-foreground hover:text-foreground"}`}>
            <s.icon className="w-3.5 h-3.5" /> {s.label}
          </button>
        ))}
      </div>

      {section === "smtp" && (
        <div className={`rounded-2xl border transition-all ${form.smtpEnabled ? "border-orange-500/20 bg-orange-500/5" : "border-border/30 bg-card/60"}`}>
          <label className="flex items-center justify-between p-5 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center"><Server className="w-4.5 h-4.5 text-orange-400" /></div>
              <div><p className="text-sm font-semibold">Custom SMTP</p><p className="text-[11px] text-muted-foreground">Send store emails from your own mail server</p></div>
            </div>
            <input type="checkbox" checked={form.smtpEnabled} onChange={e => set("smtpEnabled", e.target.checked)} className="accent-orange-500 w-4 h-4" />
          </label>
          {form.smtpEnabled && (
            <div className="px-5 pb-5 space-y-4 border-t border-border/20 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground">SMTP Host</label><Input value={form.smtpHost} onChange={e => set("smtpHost", e.target.value)} className="bg-secondary/50 border-border/30 rounded-xl mt-1" placeholder="smtp.gmail.com" /></div>
                <div><label className="text-xs text-muted-foreground">Port</label><Input type="number" value={form.smtpPort} onChange={e => set("smtpPort", parseInt(e.target.value) || 0)} className="bg-secondary/50 border-border/30 rounded-xl mt-1" placeholder="587" /></div>
                <div><label className="text-xs text-muted-foreground">Username</label><Input value={form.smtpUsername} onChange={e => set("smtpUsername", e.target.value)} className="bg-secondary/50 border-border/30 rounded-xl mt-1" placeholder="you@store.com" /></div>
                <div><label className="text-xs text-muted-foreground">Password</label><Input type="password" value={form.smtpPassword} onChange={e => set("smtpPassword", e.target.value)} className="bg-secondary/50 border-border/30 rounded-xl mt-1" placeholder="••••••••" /></div>
                <div><label className="text-xs text-muted-foreground">From Name</label><Input value={form.fromName} onChange={e => set("fromName", e.target.value)} className="bg-secondary/50 border-border/30 rounded-xl mt-1" placeholder="My Store" /></div>
                <div><label className="text-xs text-muted-foreground">From Email</label><Input value={form.fromEmail} onChange={e => set("fromEmail", e.target.value)} className="bg-secondary/50 border-border/30 rounded-xl mt-1" placeholder="noreply@store.com" /></div>
              </div>
              <label className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 cursor-pointer hover:bg-secondary/50">
                <input type="checkbox" checked={form.smtpSecure} onChange={e => set("smtpSecure", e.target.checked)} className="accent-orange-500 w-4 h-4" />
                <div><p className="text-sm font-medium">Use TLS / SSL</p><p className="text-[11px] text-muted-foreground">Recommended — encrypt the connection to your mail server</p></div>
              </label>
            </div>
          )}
        </div>
      )}

      {section === "templates" && (
        <div className="rounded-2xl border border-border/30 bg-card/60 p-5 space-y-4">
          {/* Template action tabs */}
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATE_TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTpl(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTpl === t.key ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-secondary/40 text-muted-foreground hover:text-foreground"}`}>
                {t.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 cursor-pointer hover:bg-secondary/50">
            <input type="checkbox" checked={!!tpl.enabled} onChange={e => setTpl(activeTpl, "enabled", e.target.checked)} className="accent-orange-500 w-4 h-4" />
            <div><p className="text-sm font-medium">Send "{tplMeta?.label}" email</p><p className="text-[11px] text-muted-foreground">Automatically sent for this action</p></div>
          </label>

          <div><label className="text-xs text-muted-foreground">Subject</label><Input value={tpl.subject} onChange={e => setTpl(activeTpl, "subject", e.target.value)} className="bg-secondary/50 border-border/30 rounded-xl mt-1" placeholder={tplMeta?.defaultSubject} /></div>
          <div><label className="text-xs text-muted-foreground">Body</label>
            <Textarea value={tpl.body} onChange={e => setTpl(activeTpl, "body", e.target.value)} className="bg-secondary/50 border-border/30 rounded-xl mt-1 h-40 resize-none" placeholder={`Hi {{customer_name}},\n\nThanks for choosing {{store_name}}...`} />
            <p className="text-[11px] text-muted-foreground mt-1">Variables: <code className="text-orange-400">{"{{customer_name}}"}</code>, <code className="text-orange-400">{"{{store_name}}"}</code>, <code className="text-orange-400">{"{{order_id}}"}</code></p>
          </div>
        </div>
      )}

      <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl gap-1.5 text-white border-0">
        <Save className="w-4 h-4" /> Save Email Settings
      </Button>
    </div>
  );
}