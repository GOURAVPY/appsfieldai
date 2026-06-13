import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Store, Globe, Zap, Pencil, Ban, CheckCircle, ExternalLink, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function MarketplaceManager() {
  const queryClient = useQueryClient();
  const [editMp, setEditMp] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data: marketplaces = [], isLoading } = useQuery({
    queryKey: ["allMarketplaces"],
    queryFn: () => base44.entities.Marketplace.list(),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["platformPlans"],
    queryFn: () => base44.entities.SubscriptionPlan.filter({ isActive: true }),
  });

  const openEdit = (m) => { setEditMp(m); setEditForm({ name: m.name, slug: m.slug, type: m.type, status: m.status, commissionRate: m.settings?.commissionRate ?? 0 }); };

  const handleEditSave = async () => {
    if (!editMp) return;
    const updateData = { name: editForm.name, type: editForm.type, status: editForm.status };
    if (editForm.commissionRate !== undefined) {
      updateData.settings = { ...(editMp.settings || {}), commissionRate: parseFloat(editForm.commissionRate) || 0 };
    }
    await base44.entities.Marketplace.update(editMp.id, updateData);
    queryClient.invalidateQueries({ queryKey: ["allMarketplaces"] });
    setEditMp(null);
    toast.success(`"${editForm.name}" updated`);
  };

  const handleToggleStatus = async (m) => {
    const newStatus = m.status === "active" ? "suspended" : "active";
    await base44.entities.Marketplace.update(m.id, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ["allMarketplaces"] });
    toast.success(`"${m.name}" ${newStatus === "active" ? "activated" : "suspended"}`);
  };

  const activeCount = marketplaces.filter(m => m.status === "active").length;
  const suspendedCount = marketplaces.filter(m => m.status === "suspended").length;
  const draftCount = marketplaces.filter(m => m.status === "draft").length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Store, label: "Total", count: marketplaces.length, color: "from-violet-500 to-purple-500" },
          { icon: CheckCircle, label: "Active", count: activeCount, color: "from-emerald-500 to-teal-500" },
          { icon: Ban, label: "Suspended", count: suspendedCount, color: "from-red-500 to-rose-500" },
          { icon: Globe, label: "Draft", count: draftCount, color: "from-amber-500 to-orange-500" },
        ].map((s) => (
          <Card key={s.label} className="border-border/40 bg-card/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}><s.icon className="w-4 h-4 text-white" /></div>
              <div><p className="text-lg font-display font-bold">{isLoading ? "—" : s.count}</p><p className="text-[10px] text-muted-foreground">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* All Marketplaces */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
        <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><Store className="w-4 h-4 text-violet-400" />All Marketplaces<Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-[10px] ml-2">{marketplaces.length}</Badge></CardTitle></CardHeader>
        <CardContent className="divide-y divide-border/30">
          {isLoading ? <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p> : marketplaces.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">No marketplaces yet</p> : marketplaces.map(m => {
            const plan = plans.find(p => p.id === m.planId);
            return (
              <div key={m.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center"><Store className="w-4 h-4 text-white" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{m.name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`text-[10px] border ${m.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : m.status === "draft" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>{m.status}</Badge>
                      <Badge variant="secondary" className="text-[9px]">{m.type === "multi_vendor" ? "Multi-Vendor" : "Single Vendor"}</Badge>
                      {plan && <Badge className="text-[9px] bg-violet-500/10 text-violet-400 border-violet-500/20">{plan.name}</Badge>}
                      <span className="text-[10px] text-muted-foreground">{m.slug}.yourdomain.com</span>
                    </div>
                    {m.settings?.commissionRate > 0 && <p className="text-[10px] text-amber-400 mt-0.5">Commission: {m.settings.commissionRate}%</p>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Link to={`/admin-hub/${m.id}`}><Button size="sm" variant="ghost" className="h-7 text-[11px] text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"><LayoutDashboard className="w-3 h-3 mr-1" />Hub</Button></Link>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(m)} className="h-7 text-[11px] text-muted-foreground hover:text-foreground"><Pencil className="w-3 h-3 mr-1" />Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(m)} className="h-7 text-[11px] text-muted-foreground hover:text-foreground">
                    {m.status === "active" ? <><Ban className="w-3 h-3 mr-1" />Suspend</> : <><CheckCircle className="w-3 h-3 mr-1" />Activate</>}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Edit Marketplace Dialog */}
      <Dialog open={!!editMp} onOpenChange={() => setEditMp(null)}>
        <DialogContent className="bg-card border-border/40 max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="font-display">Edit Marketplace</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground">Name</label><Input value={editForm.name || ""} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="bg-secondary/50 border-border/30 rounded-xl mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Type</label><Select value={editForm.type || "single_vendor"} onValueChange={v => setEditForm(f => ({ ...f, type: v }))}><SelectTrigger className="bg-secondary/50 border-border/30 rounded-xl mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="single_vendor">Single Vendor</SelectItem><SelectItem value="multi_vendor">Multi-Vendor</SelectItem></SelectContent></Select></div>
              <div><label className="text-xs text-muted-foreground">Status</label><Select value={editForm.status || "draft"} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}><SelectTrigger className="bg-secondary/50 border-border/30 rounded-xl mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="suspended">Suspended</SelectItem></SelectContent></Select></div>
            </div>
            <div><label className="text-xs text-muted-foreground">Commission Rate (%)</label><Input type="number" value={editForm.commissionRate ?? ""} onChange={e => setEditForm(f => ({ ...f, commissionRate: e.target.value }))} className="bg-secondary/50 border-border/30 rounded-xl mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMp(null)} className="border-border/40 rounded-xl">Cancel</Button>
            <Button onClick={handleEditSave} className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}