import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Zap, Headphones } from "lucide-react";

const STORE_DEFAULTS = { title: "Why Buy From Us", subtitle: "Everything you need, all in one place" };

const DEFAULT_BOXES = [
  { icon: ShieldCheck, title: "Secure Checkout", text: "Every purchase is protected with bank-grade encryption." },
  { icon: Zap, title: "Instant Access", text: "Get your deals delivered the moment you buy." },
  { icon: Headphones, title: "Dedicated Support", text: "Our team is here to help you any time you need it." },
];

export default function StoreCustomSection({ boxes, brandColor = "#f97316" }) {
  const items = Array.isArray(boxes) && boxes.length > 0 ? boxes : DEFAULT_BOXES;

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/50 border border-border/40 text-[11px] text-muted-foreground mb-3">
          <Sparkles className="w-3 h-3" /> {STORE_DEFAULTS.subtitle}
        </div>
        <h2 className="text-2xl font-display font-bold">{STORE_DEFAULTS.title}</h2>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {items.map((b, i) => {
          const Icon = b.icon || Sparkles;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="bg-card/60 border border-border/40 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${brandColor}22` }}>
                <Icon className="w-6 h-6" style={{ color: brandColor }} />
              </div>
              <h3 className="text-base font-display font-semibold mb-1">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.text}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}