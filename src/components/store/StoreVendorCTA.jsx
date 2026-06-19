import React from "react";
import { Rocket } from "lucide-react";

// "Become A Vendor?" call-to-action section for a store page.
// Links to the marketplace's support email so interested sellers can reach out.
export default function StoreVendorCTA({ marketplace, brandColor = "#f97316" }) {
  const email = marketplace?.supportEmail;
  const href = email ? `mailto:${email}?subject=Become a vendor on ${marketplace?.name || "your store"}` : null;

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
        {href ? (
          <a
            href={href}
            className="inline-flex px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: brandColor }}
          >
            Apply to Sell
          </a>
        ) : (
          <span className="inline-flex px-6 py-2.5 rounded-full text-sm font-semibold text-muted-foreground bg-secondary/60">
            Contact the store owner to apply
          </span>
        )}
      </div>
    </section>
  );
}