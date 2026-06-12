import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const statusBadge = (status, type = "order") => {
  const colors = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    refunded: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    partial_refund: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };
  return <Badge className={`text-[10px] border ${colors[status] || ""}`}>{status}</Badge>;
};

export default function OrderManager({ marketplaceId }) {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", marketplaceId],
    queryFn: () => base44.entities.Order.filter({ marketplaceId }, "-createdAt"),
    enabled: !!marketplaceId,
  });

  const totalRevenue = orders.filter(o => o.paymentStatus === "paid").reduce((sum, o) => sum + (o.amount || 0), 0);
  const totalCommission = orders.filter(o => o.paymentStatus === "paid").reduce((sum, o) => sum + (o.commissionAmount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-cyan-400" /> Orders
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Revenue</p>
          <p className="text-lg font-display font-bold text-emerald-400">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-violet-500/5 border border-violet-500/10 rounded-xl p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Commission Earned</p>
          <p className="text-lg font-display font-bold text-violet-400">${totalCommission.toLocaleString()}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">No orders yet.</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {orders.map((o) => (
            <div key={o.id} className="bg-card/40 border border-border/40 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-medium">{o.softwareName || "Software"}</p>
                  <p className="text-[10px] text-muted-foreground">{o.customerName || o.customerEmail} · {new Date(o.createdAt || o.created_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">${(o.amount || 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(o.paymentStatus, "payment")}
                {statusBadge(o.orderStatus, "order")}
                {o.commissionAmount > 0 && <span className="text-[10px] text-muted-foreground">Commission: ${o.commissionAmount.toLocaleString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}