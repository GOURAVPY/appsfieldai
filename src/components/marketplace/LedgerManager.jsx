import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import {
  ScrollText, ArrowDownRight, ArrowUpRight, RotateCcw, ShieldOff,
  Pause, Play, Wallet, Receipt, AlertTriangle,
} from "lucide-react";

// Read-only audit trail of every financial/access action in the marketplace.
const ACTION_META = {
  sale: { label: "Sale", icon: Receipt, color: "text-emerald-400", credit: true },
  refund: { label: "Refund", icon: RotateCcw, color: "text-red-400", credit: false },
  chargeback: { label: "Chargeback", icon: AlertTriangle, color: "text-red-400", credit: false },
  payout_created: { label: "Payout Created", icon: Wallet, color: "text-amber-400", credit: false },
  payout_paid: { label: "Payout Paid", icon: Wallet, color: "text-emerald-400", credit: false },
  payout_reversed: { label: "Payout Reversed", icon: RotateCcw, color: "text-red-400", credit: false },
  commission: { label: "Commission", icon: ArrowDownRight, color: "text-cyan-400", credit: true },
  vendor_credit: { label: "Vendor Credit", icon: ArrowUpRight, color: "text-emerald-400", credit: true },
  vendor_debit: { label: "Vendor Debit", icon: ArrowDownRight, color: "text-red-400", credit: false },
  access_revoked: { label: "Access Revoked", icon: ShieldOff, color: "text-red-400", credit: false },
  product_paused: { label: "Product Paused", icon: Pause, color: "text-amber-400", credit: false },
  product_resumed: { label: "Product Resumed", icon: Play, color: "text-emerald-400", credit: true },
};

export default function LedgerManager({ marketplaceId }) {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["ledgerEntries", marketplaceId],
    queryFn: () => base44.entities.LedgerEntry.filter({ marketplaceId }, "-created_date", 200),
    enabled: !!marketplaceId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <ScrollText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No audit records yet.</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Sales, refunds, payouts and access changes will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <ScrollText className="w-4 h-4 text-orange-400" />
        <p className="text-sm font-semibold">Audit Log</p>
        <span className="text-xs text-muted-foreground">({entries.length} records)</span>
      </div>

      {entries.map((e) => {
        const meta = ACTION_META[e.action] || { label: e.action, icon: ScrollText, color: "text-muted-foreground", credit: true };
        const Icon = meta.icon;
        const hasAmount = typeof e.amount === "number" && e.amount !== 0;
        return (
          <div key={e.id} className="flex items-start gap-3 rounded-xl border border-border/40 bg-secondary/30 p-3">
            <div className={`w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 ${meta.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm font-medium ${meta.color}`}>{meta.label}</span>
                {hasAmount && (
                  <span className={`text-sm font-display font-bold ${meta.credit ? "text-emerald-400" : "text-red-400"}`}>
                    {meta.credit ? "+" : "-"}${Math.abs(e.amount).toLocaleString()}
                  </span>
                )}
              </div>
              {e.note && <p className="text-xs text-muted-foreground mt-0.5">{e.note}</p>}
              <div className="flex items-center gap-2 mt-1 flex-wrap text-[10px] text-muted-foreground/70">
                {e.actorName && <span>by {e.actorName}</span>}
                {e.reference && <span>• ref {e.reference}</span>}
                <span>• {format(new Date(e.created_date), "MMM d, yyyy h:mm a")}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}