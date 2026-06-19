import React from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const STORE_DEFAULTS = { title: "What Our Customers Say", subtitle: "Real reviews from real buyers" };

export default function StoreTestimonials({ reviews = [], brandColor = "#f97316" }) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold">{STORE_DEFAULTS.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{STORE_DEFAULTS.subtitle}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.slice(0, 6).map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
            className="bg-card/60 border border-border/40 rounded-2xl p-5 relative">
            <Quote className="w-7 h-7 opacity-10 absolute top-4 right-4" style={{ color: brandColor }} />
            <div className="flex items-center gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star key={idx} className={`w-3.5 h-3.5 ${idx < (r.rating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
              ))}
            </div>
            {r.title && <p className="text-sm font-semibold mb-1">{r.title}</p>}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{r.content}</p>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/30">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: brandColor }}>
                {(r.userName || "?")[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-medium">{r.userName || "Anonymous"}</p>
                {r.softwareName && <p className="text-[10px] text-muted-foreground">on {r.softwareName}</p>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}