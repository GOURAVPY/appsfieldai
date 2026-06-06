import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, DollarSign, Users, Store, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const stats = [
  { icon: DollarSign, label: "Portfolio Value", value: "$48,250", change: "+12.4%", up: true, color: "from-violet-500 to-purple-500" },
  { icon: TrendingUp, label: "Monthly Revenue", value: "$2,840", change: "+8.1%", up: true, color: "from-cyan-500 to-teal-500" },
  { icon: Store, label: "Active Listings", value: "124", change: "+3 this week", up: true, color: "from-emerald-500 to-green-500" },
  { icon: Users, label: "Total Investors", value: "1,204", change: "+56", up: true, color: "from-amber-500 to-orange-500" },
];

const portfolio = [
  { name: "Real Estate Agent SaaS", shares: 12, value: 1200, revenue: 240, growth: 18, color: "bg-violet-500" },
  { name: "CRM Dashboard Pro", shares: 5, value: 2500, revenue: 500, growth: 24, color: "bg-cyan-500" },
  { name: "AI Content Writer", shares: 20, value: 2000, revenue: 400, growth: 32, color: "bg-emerald-500" },
  { name: "E-com Analytics", shares: 8, value: 800, revenue: 160, growth: 15, color: "bg-amber-500" },
];

const recentActivity = [
  { action: "Bought shares", item: "AI Content Writer", amount: "$200", time: "2h ago", type: "buy" },
  { action: "Dividend received", item: "CRM Dashboard Pro", amount: "$45", time: "5h ago", type: "dividend" },
  { action: "Listed shares", item: "E-com Analytics", amount: "5 shares", time: "1d ago", type: "sell" },
  { action: "Auction won", item: "Real Estate Agent SaaS", amount: "3 shares", time: "2d ago", type: "buy" },
];

const marketTrends = [
  { name: "AI & ML", growth: 42 },
  { name: "CRM", growth: 28 },
  { name: "Analytics", growth: 35 },
  { name: "E-commerce", growth: 22 },
  { name: "Marketing", growth: 30 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back, Alex. Here's your portfolio overview.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="border-border/40 bg-card/60 backdrop-blur-xl hover:border-violet-500/20 transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} bg-opacity-10 flex items-center justify-center`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${s.up ? "text-emerald-400" : "text-red-400"}`}>
                    {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {s.change}
                  </div>
                </div>
                <p className="text-2xl font-display font-bold mt-3">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-violet-400" />
                Portfolio Performance
              </CardTitle>
              <Badge variant="outline" className="text-[10px] border-border/40">This Month</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolio.map((p, i) => (
                  <div key={p.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-muted-foreground">{p.shares} shares · ${p.revenue}/mo</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={p.growth * 2} className="h-2 flex-1 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-cyan-500" />
                      <span className="text-xs font-medium text-emerald-400 w-10 text-right">+{p.growth}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <PieChart className="w-4 h-4 text-cyan-400" />
                Market Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {marketTrends.map((t) => (
                <div key={t.name} className="flex items-center justify-between">
                  <span className="text-sm">{t.name}</span>
                  <span className="text-sm font-medium text-emerald-400">+{t.growth}%</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/30">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${a.type === "buy" ? "bg-emerald-500" : a.type === "sell" ? "bg-amber-500" : "bg-violet-500"}`} />
                    <div>
                      <p className="text-sm">{a.action} <span className="font-medium">{a.item}</span></p>
                      <p className="text-[11px] text-muted-foreground">{a.time}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">{a.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}