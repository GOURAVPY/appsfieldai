import React from "react";
import { Store } from "lucide-react";

export default function StoreFooter({ marketplace, footerText }) {
  const brandColor = marketplace?.branding?.primaryColor || "#f97316";
  const year = new Date().getFullYear();
  const defaultText = `© ${year} ${marketplace?.name || "Our Store"}. All rights reserved.`;

  return (
    <footer className="border-t border-border/40 bg-card/40 backdrop-blur-xl mt-8">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {marketplace?.branding?.logo ? (
            <img src={marketplace.branding.logo} alt={marketplace.name} className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: brandColor }}>
              <Store className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="font-display font-semibold text-sm">{marketplace?.name}</span>
        </div>
        <p className="text-xs text-muted-foreground text-center">{footerText || defaultText}</p>
        {marketplace?.supportEmail && (
          <a href={`mailto:${marketplace.supportEmail}`} className="text-xs text-muted-foreground hover:text-foreground">{marketplace.supportEmail}</a>
        )}
      </div>
    </footer>
  );
}