import React, { useState } from "react";
import { Rocket } from "lucide-react";
import StoreVendorApplyModal from "@/components/store/StoreVendorApplyModal";

// "Become A Vendor?" call-to-action section for a store page.
// Opens a vendor application form scoped to THIS store.
export default function StoreVendorCTA({ marketplace, brandColor = "#f97316" }) {
  const [open, setOpen] = useState(false);

  return (
    <section id="store-become-vendor" className="max-w-7xl mx-auto px-6 py-12">
      <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-secondary/40 to-secondary/10 p-8 text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: brandColor }}>
          <Rocket className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">Become A Vendor?</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          Want to list your own software on {marketplace?.name || "this store"}? Get in touch and start selling to our community.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: brandColor }}
        >
          Apply to Sell
        </button>
      </div>

      <StoreVendorApplyModal open={open} onClose={() => setOpen(false)} marketplace={marketplace} brandColor={brandColor} />
    </section>
  );
}