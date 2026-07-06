import React, { useState } from "react";
import { motion } from "framer-motion";
import { Share2, UserPlus, Megaphone, Wallet, ChevronDown, TrendingUp } from "lucide-react";

const STEPS = [
  { Icon: UserPlus, title: "Apply", desc: "Sign up as an affiliate and pick the products you want to promote. Start as soon as you're approved." },
  { Icon: Megaphone, title: "Share", desc: "Grab your unique referral link for each product and share it with your audience and network." },
  { Icon: Wallet, title: "Get Paid", desc: "Earn commission on every sale made through your link, paid out after the refund window clears." },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border/40 rounded-xl bg-card/60 overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left">
        <span className="text-sm font-medium">{q}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{a}</div>}
    </div>
  );
}

export default function StoreAffiliateLanding({ affiliateSettings, brandColor = "#f97316", onApply }) {
  const maxRate = affiliateSettings?.maxCommissionRate ?? 50;
  const holdDays = affiliateSettings?.holdDays ?? 14;

  const faqs = [
    {
      q: "How do I join the affiliate program?",
      a: "Click 'Apply Today', create your account (or sign in), then choose the products you'd like to promote. Once the store owner approves your application, you can start sharing your referral links.",
    },
    {
      q: "How much commission can I earn?",
      a: `You can earn up to ${maxRate}% commission on every sale made through your referral link. The exact rate depends on the product and any custom rate the store owner sets for you.`,
    },
    {
      q: "How and when do I get paid?",
      a: `Commissions are held for ${holdDays} days to cover the refund window. After a sale clears that window it becomes payable, and you can track cleared, on-hold and refunded amounts right in your affiliate dashboard.`,
    },
    {
      q: "How do I track my referrals and earnings?",
      a: "Every approved affiliate gets a dashboard showing referral links, live commission history, and cleared/pending/refunded totals — so you always know exactly what you've earned.",
    },
    {
      q: "Do you provide anything to help me promote?",
      a: "Yes. For products you're approved on, you get a unique referral link plus any promotion materials the store owner shares (banners, email swipes and product details) inside your dashboard.",
    },
  ];

  return (
    <section id="affiliate-program" className="max-w-5xl mx-auto px-6 py-16 scroll-mt-20">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center rounded-3xl border border-border/40 p-8 sm:p-12 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${brandColor}18, transparent 60%)` }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4" style={{ background: `${brandColor}22`, color: brandColor }}>
          <Share2 className="w-3.5 h-3.5" /> Affiliate Program
        </div>
        <h2 className="text-2xl sm:text-4xl font-display font-bold leading-tight">
          Earn up to <span style={{ color: brandColor }}>{maxRate}% commission</span>
          <br className="hidden sm:block" /> promoting our products
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-xl mx-auto">
          Share products you love, bring in new customers, and get paid for every sale made through your referral link.
        </p>
        <button
          onClick={onApply}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ background: brandColor }}
        >
          <TrendingUp className="w-4 h-4" /> Apply Today
        </button>
      </motion.div>

      {/* How it works */}
      <div className="mt-14">
        <h3 className="text-center text-xl font-display font-bold mb-8">How it works</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border/40 bg-card/60 p-5 text-center relative"
            >
              <div className="absolute top-4 right-4 text-4xl font-display font-black opacity-10">{i + 1}</div>
              <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-3" style={{ background: `${brandColor}1a`, color: brandColor }}>
                <s.Icon className="w-6 h-6" />
              </div>
              <p className="font-display font-bold">{s.title}</p>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="mt-14 max-w-2xl mx-auto">
        <h3 className="text-center text-xl font-display font-bold mb-6">Frequently asked questions</h3>
        <div className="space-y-3">
          {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </div>
    </section>
  );
}