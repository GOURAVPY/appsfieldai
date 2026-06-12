import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Wallet, CheckCircle, Loader2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const statusBadge = (status) => {
  const map = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return <Badge className={`text-[10px] border ${map[status] || ""}`}>{status}</Badge>;
};

export default function PayoutManager({ marketplaceId }) {
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(null);

  const { data: payouts = [], isLoading } = useQuery({
    queryKey: ["payouts", marketplaceId],
    queryFn: () => base44.entities.Payout.filter({ marketplaceId }, "-payoutDate"),
    enabled: !!marketplaceId,
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["payoutVendors", marketplaceId],
    queryFn: () => base44.entities.Vendor.filter({ marketplaceId, status: "approved" }),
    enabled: !!marketplaceId,
  });

  const handleMarkPaid = async (payout) => {
    setActionLoading(payout.id);
    await base44.entities.Payout.update(payout.id, { status: "paid", payoutDate: new Date().toISOString() });
    queryClient.invalidateQueries({ queryKey: ["payouts", marketplaceId] });
    setActionLoading(null);
    toast.success(`Payout of $${payout.amount.toLocaleString()} marked as paid.`);
  };

  const handleCreatePayout = async (vendor) => {
    if (!vendor.payoutBalance || vendor.payoutBalance <= 0) {
      toast.error("No balance to payout.");
      return;
    }
    setActionLoading(vendor.id);
    await base44.entities.Payout.create({
      marketplaceId,
      vendorId: vendor.id,
      vendorName: vendor.vendorName,
      amount: vendor.payoutBalance,
      status: "pending",
    });
    await base44.entities.Vendor.update(vendor.id, { payoutBalance: 0 });
    queryClient.invalidateQueries({ queryKey: ["payouts", marketplaceId] });
    queryClient.invalidateQueries({ queryKey: ["payoutVendors", marketplaceId] });
    setActionLoading(null);
    toast.success(`Payout created for ${vendor.vendorName}.`);
  };

  const totalPaid = payouts.filter(p => p.status === "paid").reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold flex items-center gap-2">
          <Wallet className="w-5 h-5 text-amber-400" /> Payouts
        </h3>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Paid Out</p>
        <p className="text-lg font-display font-bold text-amber-400">${totalPaid.toLocaleString()}</p>
      </div>

      {/* Vendors with balance */}
      {vendors.filter(v => (v.payoutBalance || 0) > 0).length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ready for Payout</p>
          <div className="space-y-1.5">
            {vendors.filter(v => (v.payoutBalance || 0) > 0).map(v => (
              <div key={v.id} className="flex items-center justify-between bg-card/40 border border-border/40 rounded-xl p-3">
                <div>
                  <p className="text-xs font-medium">{v.vendorName}</p>
                  <p className="text-sm font-semibold text-emerald-400">${(v.payoutBalance || 0).toLocaleString()}</p>
                </div>
                <Button size="sm" onClick={() => handleCreatePayout(v)} disabled={actionLoading === v.id} className="bg-amber-600 hover:bg-amber-700 rounded-lg text-xs h-7">
                  {actionLoading === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Pay Out"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payout History */}
      {isLoading ? (
        <div className="text-center py-4 text-muted-foreground text-sm"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
      ) : payouts.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-sm">No payouts yet.</div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {payouts.map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-card/40 border border-border/40 rounded-xl p-3">
              <div>
                <p className="text-xs font-medium">{p.vendorName}</p>
                <p className="text-[10px] text-muted-foreground">{p.payoutMethod || "bank_transfer"} · {new Date(p.payoutDate || p.created_date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">${(p.amount || 0).toLocaleString()}</span>
                {statusBadge(p.status)}
                {p.status === "pending" && (
                  <Button size="sm" variant="ghost" onClick={() => handleMarkPaid(p)} disabled={actionLoading === p.id} className="h-7 w-7 p-0 text-emerald-400"><CheckCircle className="w-3.5 h-3.5" /></Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}