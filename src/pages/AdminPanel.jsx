import React from "react";
import { motion } from "framer-motion";
import {
  Users, Store, Gavel, DollarSign, AlertCircle, CheckCircle, Clock, Ban, Eye, Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const adminStats = [
  { icon: Store, label: "Total Listings", value: "124", color: "from-violet-500 to-purple-500" },
  { icon: Gavel, label: "Active Auctions", value: "18", color: "from-amber-500 to-orange-500" },
  { icon: Users, label: "Total Users", value: "1,204", color: "from-cyan-500 to-teal-500" },
  { icon: DollarSign, label: "Platform Revenue", value: "$12,450", color: "from-emerald-500 to-green-500" },
];

const pendingListings = [
  { id: 1, name: "Social Scheduler Pro", seller: "DevHub LLC", category: "Marketing", price: "$4,200", submitted: "2h ago", status: "pending" },
  { id: 2, name: "HR Management Suite", seller: "CloudBase Inc.", category: "Productivity", price: "$8,900", submitted: "5h ago", status: "pending" },
  { id: 3, name: "Invoice Generator AI", seller: "FinStack", category: "Finance", price: "$3,100", submitted: "1d ago", status: "pending" },
];

const reportedItems = [
  { id: 1, name: "SEO Tool Pro", reason: "Inaccurate revenue claims", reportedBy: "Sarah M.", date: "1d ago" },
  { id: 2, name: "Email Blaster", reason: "Suspicious activity", reportedBy: "James K.", date: "2d ago" },
];

export default function AdminPanel() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage listings, users, and platform operations.</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-display font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pending Approvals */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Pending Approvals
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">{pendingListings.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/30">
            {pendingListings.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <Store className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{l.name}</p>
                    <p className="text-[11px] text-muted-foreground">{l.seller} · {l.category} · {l.price} · {l.submitted}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 h-8 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 text-xs">
                    <Ban className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Reports & Active Listings */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                Reported Items
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">{reportedItems.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/30">
              {reportedItems.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground">{r.reason} — reported by {r.reportedBy} · {r.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground h-8 text-xs">
                      <Eye className="w-3.5 h-3.5 mr-1" /> Review
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 h-8 text-xs">
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base font-display">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "View All Listings", desc: "Browse and manage all active SaaS listings" },
                { label: "User Management", desc: "Manage user accounts and permissions" },
                { label: "Revenue Reports", desc: "View platform commissions and earnings" },
                { label: "Audit Log", desc: "Track all platform activity and changes" },
              ].map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="text-[11px] text-muted-foreground">{a.desc}</p>
                  </div>
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}