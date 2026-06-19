import React, { useState } from "react";
import { X, Loader2, Rocket, CheckCircle, Store, Mail, Phone } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Store-scoped vendor application — submits a Vendor application for THIS marketplace only.
export default function StoreVendorApplyModal({ open, onClose, marketplace, brandColor = "#f97316" }) {
  const [form, setForm] = useState({ vendorName: "", email: "", phone: "", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    if (open) { setError(""); setSubmitted(false); setForm({ vendorName: "", email: "", phone: "", description: "" }); }
  }, [open]);

  if (!open) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.vendorName || !form.email) { setError("Business name and email are required."); return; }
    setLoading(true);
    try {
      const res = await base44.functions.invoke("storeVendorApply", { marketplaceId: marketplace.id, ...form });
      if (res.data?.error) throw new Error(res.data.error);
      setSubmitted(true);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full pl-9 pr-3 py-2.5 rounded-xl bg-secondary/60 border border-border/40 text-sm focus:outline-none focus:ring-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-card border border-border/40 rounded-2xl p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <CheckCircle className="w-14 h-14 mx-auto mb-3 text-emerald-400" />
            <h2 className="text-lg font-display font-bold">Application Submitted!</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {marketplace.name}'s team will review your application and get in touch.
            </p>
            <button onClick={onClose} className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: brandColor }}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-3" style={{ background: brandColor }}>
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-display font-bold">Become a Vendor</h2>
              <p className="text-xs text-muted-foreground mt-1">Apply to sell your software on {marketplace.name}.</p>
            </div>

            <form onSubmit={submit} className="space-y-3">
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input className={inputCls} placeholder="Business / brand name" value={form.vendorName} onChange={set("vendorName")} style={{ "--tw-ring-color": brandColor }} />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input className={inputCls} type="email" placeholder="Email" required value={form.email} onChange={set("email")} style={{ "--tw-ring-color": brandColor }} />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input className={inputCls} placeholder="Phone (optional)" value={form.phone} onChange={set("phone")} style={{ "--tw-ring-color": brandColor }} />
              </div>
              <textarea
                className="w-full px-3 py-2.5 rounded-xl bg-secondary/60 border border-border/40 text-sm h-20 focus:outline-none focus:ring-1"
                placeholder="Tell us about your software (optional)"
                value={form.description}
                onChange={set("description")}
                style={{ "--tw-ring-color": brandColor }}
              />

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: brandColor }}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Application
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}