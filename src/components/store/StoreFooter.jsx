import React from "react";
import { Link } from "react-router-dom";
import { Store } from "lucide-react";

export default function StoreFooter({ marketplace, footerText, customPages = [], storeBasePath = "" }) {
  const brandColor = marketplace?.branding?.primaryColor || "#f97316";
  const year = new Date().getFullYear();
  const defaultText = `© ${year} ${marketplace?.name || "Our Store"}. All rights reserved.`;
  const footerPages = (customPages || []).filter(p => p.showInFooter);

  return (
    <footer className="border-t border-border/40 bg-card/40 backdrop-blur-xl mt-8">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
        {footerPages.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {footerPages.map(p => (
              <Link key={p.id} to={`${storeBasePath}/page/${p.slug}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {p.title}
              </Link>
            ))}
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
      </div>
    </footer>
  );
}