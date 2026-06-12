import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { TicketPercent, Plus, Trash2, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function CouponManager({ marketplaceId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", discountType: "percentage", discountValue: "", startDate: "", endDate: "", usageLimit: "", softwareId: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["coupons", marketplaceId],
    queryFn: () => base44.entities.Coupon.filter({ marketplaceId }),
    enabled: !!marketplaceId,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ["couponSoftware", marketplaceId],
    queryFn: () => base44.entities.SaaSListing.filter({ marketplaceId }),
    enabled: !!marketplaceId,
  });

  const handleCreate = async () => {
    if (!form.code || !form.discountValue) return toast.error("Code and discount value required.");
    setSaving(true);
    await base44.entities.Coupon.create({
      marketplaceId,
      code: form.code.toUpperCase(),
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue),
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
      softwareId: form.softwareId || undefined,
    });
    queryClient.invalidateQueries({ queryKey: ["coupons", marketplaceId] });
    setSaving(false);
    setShowForm(false);
    setForm({ code: "", discountType: "percentage", discountValue: "", startDate: "", endDate: "", usageLimit: "", softwareId: "" });
    toast.success("Coupon created!");
  };

  const handleDelete = async (coupon) => {
    setDeleting(coupon.id);
    await base44.entities.Coupon.delete(coupon.id);
    queryClient.invalidateQueries({ queryKey: ["coupons", marketplaceId] });
    setDeleting(null);
    toast.success("Coupon deleted.");
  };

  const handleToggle = async (coupon) => {
    await base44.entities.Coupon.update(coupon.id, { isActive: !coupon.isActive });
    queryClient.invalidateQueries({ queryKey: ["coupons", marketplaceId] });
    toast.success(`Coupon ${coupon.isActive ? "deactivated" : "activated"}.`);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied!");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold flex items-center gap-2">
          <TicketPercent className="w-5 h-5 text-pink-400" /> Coupons & Deals
        </h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-pink-600 hover:bg-pink-700 rounded-xl text-xs h-8">
          <Plus className="w-3 h-3 mr-1" /> New Coupon
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card/40 border border-border/40 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase">Code</label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. LAUNCH50" className="h-8 text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase">Type</label>
              <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase">Value</label>
              <Input value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder={form.discountType === "percentage" ? "20" : "50"} type="number" className="h-8 text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase">Usage Limit</label>
              <Input value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Unlimited" type="number" className="h-8 text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase">Start Date</label>
              <Input value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} type="datetime-local" className="h-8 text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase">End Date</label>
              <Input value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} type="datetime-local" className="h-8 text-xs" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase">Specific Software (optional)</label>
            <Select value={form.softwareId} onValueChange={(v) => setForm({ ...form, softwareId: v === "all" ? "" : v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All software" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Software (Marketplace-wide)</SelectItem>
                {listings.map((l) => <SelectItem key={l.id} value={l.id}>{l.softwareName || l.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)} className="h-7 text-xs">Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={saving} className="bg-pink-600 hover:bg-pink-700 h-7 text-xs">{saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}Create</Button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="text-center py-4 text-muted-foreground text-sm"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-sm">No coupons created yet.</div>
      ) : (
        <div className="space-y-2">
          {coupons.map((c) => (
            <div key={c.id} className="flex items-center justify-between bg-card/40 border border-border/40 rounded-xl p-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-pink-400">{c.code}</span>
                  <button onClick={() => copyCode(c.code)} className="text-muted-foreground hover:text-foreground"><Copy className="w-3 h-3" /></button>
                  <Badge className={`text-[9px] ${c.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"}`}>{c.isActive ? "Active" : "Inactive"}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {c.discountType === "percentage" ? `${c.discountValue}% off` : `$${c.discountValue} off`}
                  {c.softwareId && " · Specific software"}
                  {c.usageLimit && ` · ${c.usedCount || 0}/${c.usageLimit} used`}
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => handleToggle(c)} className="h-7 text-xs">{c.isActive ? "Disable" : "Enable"}</Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(c)} disabled={deleting === c.id} className="h-7 w-7 p-0 text-red-400"><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}