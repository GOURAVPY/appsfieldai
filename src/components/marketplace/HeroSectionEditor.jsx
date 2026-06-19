import React from "react";
import { Input } from "@/components/ui/input";

// Hero Section editor for a store's Page Settings — mirrors the admin dashboard
// hero controls (badge, headline, subtitle, CTA, cover image, background style).
export default function HeroSectionEditor({ form, setForm }) {
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const bgType = form.heroBgType || "gradient";

  return (
    <div className="space-y-4">
      {/* Badge */}
      <div>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Badge</p>
        <Input
          value={form.heroBadgeText || ""}
          onChange={e => set("heroBadgeText", e.target.value)}
          className="bg-secondary/50 border-border/30 rounded-xl"
          placeholder="The Future of SaaS Ownership"
        />
      </div>

      {/* Headline & subtitle */}
      <div>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Headline & Subtitle</p>
        <div className="space-y-2">
          <Input
            value={form.headerTitle || ""}
            onChange={e => set("headerTitle", e.target.value)}
            className="bg-secondary/50 border-border/30 rounded-xl"
            placeholder="Welcome to our marketplace"
          />
          <Input
            value={form.headerSubtitle || ""}
            onChange={e => set("headerSubtitle", e.target.value)}
            className="bg-secondary/50 border-border/30 rounded-xl"
            placeholder="Discover amazing software deals"
          />
        </div>
      </div>

      {/* CTA */}
      <div>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">CTA Button</p>
        <Input
          value={form.heroCtaText || ""}
          onChange={e => set("heroCtaText", e.target.value)}
          className="bg-secondary/50 border-border/30 rounded-xl"
          placeholder="Browse deals"
        />
      </div>

      {/* Background */}
      <div>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Background</p>
        <div className="flex gap-2 mb-3">
          {[
            { val: "gradient", label: "Gradient" },
            { val: "solid", label: "Solid Color" },
            { val: "image", label: "Image" },
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => set("heroBgType", opt.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                bgType === opt.val
                  ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                  : "bg-secondary/50 text-muted-foreground border-border/30 hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {bgType === "gradient" && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "heroGradientStart", label: "Start Color", fallback: "#f97316" },
              { key: "heroGradientEnd", label: "End Color", fallback: "#0a0603" },
            ].map(({ key, label, fallback }) => (
              <div key={key}>
                <label className="text-[10px] text-muted-foreground block mb-1">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form[key] || fallback}
                    onChange={e => set(key, e.target.value)}
                    className="w-8 h-8 rounded-lg border border-border/30 cursor-pointer bg-transparent p-0.5"
                  />
                  <Input
                    value={form[key] || ""}
                    onChange={e => set(key, e.target.value)}
                    placeholder={fallback}
                    className="bg-secondary/50 border-border/30 rounded-lg text-xs h-8 font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {bgType === "solid" && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.heroSolidColor || "#0a0603"}
              onChange={e => set("heroSolidColor", e.target.value)}
              className="w-8 h-8 rounded-lg border border-border/30 cursor-pointer bg-transparent p-0.5"
            />
            <Input
              value={form.heroSolidColor || ""}
              onChange={e => set("heroSolidColor", e.target.value)}
              placeholder="#0a0603"
              className="bg-secondary/50 border-border/30 rounded-lg text-xs h-8 font-mono w-40"
            />
          </div>
        )}

        {bgType === "image" && (
          <Input
            value={form.headerImageUrl || ""}
            onChange={e => set("headerImageUrl", e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="bg-secondary/50 border-border/30 rounded-xl text-xs"
          />
        )}

        {/* Opacity */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Background Opacity</p>
            <span className="text-xs text-orange-400 font-mono">{form.heroBgOpacity ?? 100}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            value={form.heroBgOpacity ?? 100}
            onChange={e => set("heroBgOpacity", Number(e.target.value))}
            className="w-full accent-orange-500 h-1.5 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}