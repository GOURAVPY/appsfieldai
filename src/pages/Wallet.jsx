import React from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowUpCircle, ArrowDownCircle, CreditCard, History, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const transactions = [
  { type: "Deposit", amount: "+$1,000", date: "Jun 5, 2026", status: "completed", icon: ArrowDownCircle, color: "text-emerald-400" },
  { type: "Share Purchase", amount: "-$200", date: "Jun 5, 2026", status: "completed", icon: ArrowUpCircle, color: "text-cyan-400" },
  { type: "Dividend", amount: "+$45", date: "Jun 4, 2026", status: "completed", icon: ArrowDownCircle, color: "text-emerald-400" },
  { type: "Withdrawal", amount: "-$500", date: "Jun 3, 2026", status: "pending", icon: Send, color: "text-amber-400" },
  { type: "Dividend", amount: "+$24", date: "Jun 2, 2026", status: "completed", icon: ArrowDownCircle, color: "text-emerald-400" },
  { type: "Deposit", amount: "+$2,500", date: "May 28, 2026", status: "completed", icon: ArrowDownCircle, color: "text-emerald-400" },
];

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Wallet</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your funds, deposits, and withdrawals.</p>
      </motion.div>

      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border/40 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-cyan-700 p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Available Balance</p>
                <p className="text-4xl font-display font-bold mt-1">$4,850.00</p>
                <p className="text-white/50 text-xs mt-2">Wallet ID: 0x8f3a...9c2b</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                <Wallet className="w-8 h-8" />
              </div>
            </div>
          </div>
          <CardContent className="p-4 flex gap-3">
            <Button className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl h-10 text-sm">
              <Plus className="w-4 h-4 mr-2" /> Deposit
            </Button>
            <Button variant="outline" className="flex-1 border-border/40 rounded-xl h-10 text-sm">
              <Send className="w-4 h-4 mr-2" /> Withdraw
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Total Deposited", value: "$4,250", icon: ArrowDownCircle, color: "text-emerald-400" },
          { label: "Total Spent", value: "$1,820", icon: ArrowUpCircle, color: "text-cyan-400" },
          { label: "Pending", value: "$500", icon: History, color: "text-amber-400" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
              <CardContent className="p-4">
                <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                <p className="text-lg font-display font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Transactions */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-display">Transaction History</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">View All</Button>
        </CardHeader>
        <CardContent className="divide-y divide-border/30">
          {transactions.map((t, i) => (
            <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary/50 flex items-center justify-center">
                  <t.icon className={`w-4 h-4 ${t.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{t.type}</p>
                  <p className="text-[11px] text-muted-foreground">{t.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${t.color}`}>{t.amount}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{t.status}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}