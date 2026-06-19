import React from "react";
import { Store, Menu, X } from "lucide-react";

// Top navigation bar for a customer's public store page — mirrors the main app's
// top bar (logo + nav links), styled with the store's own branding.
export default function StoreNavbar({ marketplace, sections = {} }) {
  const brandColor = marketplace.branding?.primaryColor || "#f97316";
  const logo = sections.headerLogoUrl || marketplace.branding?.logo;
  const name = marketplace.name || "Store";
  const [menuOpen, setMenuOpen] = React.useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const navItems = [
    { label: "Best Sellers", target: "store-best-sellers" },
    { label: "Categories", target: "store-categories" },
    { label: "Lifetime Deals", target: "store-lifetime-deals" },
    { label: "Become A Vendor?", target: "store-become-vendor" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button onClick={() => scrollTo("store-listings")} className="flex items-center gap-2.5">
          {logo ? (
            <img src={logo} alt={name} className="w-9 h-9 object-contain rounded-lg" />
          ) : (
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: brandColor }}>
              <Store className="w-5 h-5 text-white" />
            </div>
          )}
          <span className="text-lg font-display font-bold truncate max-w-[200px]">{name}</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.target}
              onClick={() => scrollTo(item.target)}
              className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo("store-listings")}
            className="ml-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: brandColor }}
          >
            Browse Deals
          </button>
        </nav>

        {/* Mobile toggle */}
        <button onClick={() => setMenuOpen((o) => !o)} className="md:hidden p-2 rounded-lg hover:bg-secondary/50">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-border/40 px-6 py-3 flex flex-col gap-1 bg-background/95">
          {navItems.map((item) => (
            <button
              key={item.target}
              onClick={() => scrollTo(item.target)}
              className="text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo("store-listings")}
            className="mt-1 px-4 py-2 rounded-full text-sm font-semibold text-white"
            style={{ background: brandColor }}
          >
            Browse Deals
          </button>
        </nav>
      )}
    </header>
  );
}