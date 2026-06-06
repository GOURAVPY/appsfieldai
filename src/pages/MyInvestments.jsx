import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, PieChart, BarChart3, DollarSign, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const investments = [
  { name: "Real Estate Agent SaaS", shares: 12, invested: 1200, currentValue: 1440, revenue: 240, growth: 18, sharePrice: 100, color: "from-violet-500 to-purple-500" },
  { name: "CRM Dashboard Pro", shares: 5, invested: 1250, currentValue: 1625, revenue: 500, growth: 24, sharePrice: 250, color: "from-cyan-500 to-teal-500" },
  { name: "AI Content Writer", shares: 20, invested: 2000, currentValue: 2560, revenue: 400, growth: 32, sharePrice: 100, color: "from-emerald-500 to-green-500" },
  { name: "E-com Analytics Tool", shares: 8, invested: 400, currentValue: 480, revenue: 160, growth: 15, sharePrice: 50, color: "from-amber-500 to-orange-500" },
  { name: "Marketing Automator", shares: 3, invested: 390, currentValue: 440, revenue: 90, growth: 28, sharePrice: 130, color: "from-rose-500 to-pink-500" },
];

const transactionHistory = [
  { type: "Dividend", item: "CRM Dashboard Pro", amount: "+$45", date: "Jun 6, 2026", color: "text-emerald-400" },
  { type: "Share Purchase", item: "AI Content Writer", amount: "-$200", date: "Jun 5, 2026", color: "text-cyan-400" },
  { type: "Dividend", item: "Real Estate Agent SaaS", amount: "+$24", date: "Jun 4, 2026", color: "text-emerald-400" },
  { type: "Share Sale", item: "E-com Analytics", amount: "+$120", date: "Jun 2, 2026", color: "text-amber-400" },
  { type: "Share Purchase", item: "Marketing Automator", amount: "-$130", date: "May 30, 2026", color: "text-cyan-400" },
];

export default function MyInvestments() {
  const totalInvested = investments.reduce((s, i) => s + i.invested, 0);
  const totalValue = investments.reduce((s, i) => s + i.currentValue, 0);
  const totalRevenue = investments.reduce((s, i) => s + i.revenue, 0);
  const profit = totalValue - totalInvested;
  const profitPct = ((profit / totalInvested) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">My Investments</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your SaaS portfolio performance.</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Invested", value: `$${totalInvested.toLocaleString()}`, icon: DollarSign, color: "from-violet-500 to-purple-500" },
          { label: "Current Value", value: `$${totalValue.toLocaleString()}`, icon: BarChart3, color: "from-cyan-500 to-teal-500" },
          { label: "Total Profit", value: `${profit >= 0 ? "+" : ""}$${profit.toLocaleString()}`, icon: TrendingUp, color: "from-emerald-500 to-green-500", extra: `${profitPct}%` },
          { label: "Monthly Revenue", value: `$${totalRevenue}/mo`, icon: DollarSign, color: "from-amber-500 to-orange-500" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-display font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                {s.extra && <p className="text-xs text-emerald-400 mt-0.5">{s.extra}</p>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Holdings */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
        <CardHeader><CardTitle className="text-base font-display">My Holdings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {investments.map((inv, i) => (
            <motion.div
              key={inv.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${inv.color} flex items-center justify-center shrink-0`}>
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{inv.name}</p>
                  <span className={`text-xs font-medium ${inv.growth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    +{inv.growth}%
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{inv.shares} shares</span>
                  <span>·</span>
                  <span>${inv.revenue}/mo</span>
                  <span>·</span>
                  <span>Invested ${inv.invested}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-display font-bold">${inv.currentValue}</p>
                <p className={`text-[11px] ${inv.currentValue >= inv.invested ? "text-emerald-400" : "text-red-400"}`}>
                  {inv.currentValue >= inv.invested ? "+" : ""}${inv.currentValue - inv.invested}
                </p>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
        <CardHeader><CardTitle className="text-base font-display">Transaction History</CardTitle></CardHeader>
        <CardContent className="divide-y divide-border/30">
          {transactionHistory.map((t, i) => (
            <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center`}>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm"><span className="font-medium">{t.type}</span> — {t.item}</p>
                  <p className="text-[11px] text-muted-foreground">{t.date}</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${t.color}`}>{t.amount}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}