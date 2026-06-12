import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Users, Ban, Undo2, Loader2, Download, Mail, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function CustomerManager({ marketplaceId }) {
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ["customerOrders", marketplaceId],
    queryFn: () => base44.entities.Order.filter({ marketplaceId }),
    enabled: !!marketplaceId,
  });

  // Extract unique customers from orders
  const customersMap = {};
  orders.forEach((o) => {
    if (!customersMap[o.customerId]) {
      customersMap[o.customerId] = {
        id: o.customerId,
        name: o.customerName || "Unknown",
        email: o.customerEmail,
        totalSpent: 0,
        orderCount: 0,
        lastOrder: null,
        status: "active",
      };
    }
    customersMap[o.customerId].totalSpent += o.paymentStatus === "paid" ? (o.amount || 0) : 0;
    customersMap[o.customerId].orderCount++;
    if (!customersMap[o.customerId].lastOrder || new Date(o.createdAt || o.created_date) > new Date(customersMap[o.customerId].lastOrder)) {
      customersMap[o.customerId].lastOrder = o.createdAt || o.created_date;
    }
  });
  const customers = Object.values(customersMap);

  const handleExport = () => {
    const csv = "Name,Email,Orders,Total Spent,Last Order\n" + customers.map(c => `"${c.name}","${c.email}",${c.orderCount},${c.totalSpent},${c.lastOrder ? new Date(c.lastOrder).toLocaleDateString() : ""}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Customers exported.");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-green-400" /> Customers
        </h3>
        <Button size="sm" variant="outline" onClick={handleExport} className="rounded-xl text-xs h-8">
          <Download className="w-3 h-3 mr-1" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-violet-500/5 border border-violet-500/10 rounded-xl p-3 text-center">
          <p className="text-lg font-display font-bold">{customers.length}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-center">
          <p className="text-lg font-display font-bold">{orders.length}</p>
          <p className="text-[10px] text-muted-foreground">Orders</p>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-center">
          <p className="text-lg font-display font-bold">${customers.reduce((s, c) => s + c.totalSpent, 0).toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Revenue</p>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">No customers yet.</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {customers.map((c) => (
            <div key={c.id} className="flex items-center justify-between bg-card/40 border border-border/40 rounded-xl p-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{c.name}</span>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-3">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                  <span className="flex items-center gap-1"><ShoppingCart className="w-3 h-3" />{c.orderCount} orders</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">${c.totalSpent.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">{c.lastOrder ? new Date(c.lastOrder).toLocaleDateString() : ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}