import React, { useState } from "react";
import {
  CheckCircle2, Clock, Package, ChevronDown, KeyRound, ExternalLink,
  Copy, Truck, CircleDot
} from "lucide-react";
import { toast } from "sonner";

// Maps order fulfillment status to a customer-friendly label + style.
const STATUS = {
  placed: { label: "Pending", icon: Clock, cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  processing: { label: "Approved", icon: CircleDot, cls: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  completed: { label: "Delivered", icon: Truck, cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  cancelled: { label: "Cancelled", icon: Clock, cls: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const PAY_STATUS = {
  pending: { label: "Payment pending", cls: "text-amber-400" },
  paid: { label: "Paid", cls: "text-emerald-400" },
  failed: { label: "Payment failed", cls: "text-red-400" },
  refunded: { label: "Refunded", cls: "text-muted-foreground" },
};

export default function StoreOrderCard({ order, brandColor = "#f97316" }) {
  const [open, setOpen] = useState(false);
  const st = STATUS[order.status] || STATUS.placed;
  const pay = PAY_STATUS[order.paymentStatus] || PAY_STATUS.pending;
  const StIcon = st.icon;
  const delivered = order.status === "completed";
  const hasAccess = delivered && order.delivery && (order.delivery.accessUrl || order.delivery.instructions);

  const copy = (text) => {
    navigator.clipboard?.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${st.cls}`}>
                <StIcon className="w-3 h-3" /> {st.label}
              </span>
              <span className={`text-[10px] ${pay.cls}`}>· {pay.label}</span>
            </div>
            <p className="text-sm font-semibold mt-1.5 truncate">
              {(order.items || []).map((i) => i.listingTitle).join(", ") || "Order"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {new Date(order.createdAt).toLocaleDateString()} · {(order.items || []).reduce((s, i) => s + (i.quantity || 1), 0)} item(s)
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-display font-bold" style={{ color: brandColor }}>
              {order.currency} ${order.total.toLocaleString()}
            </p>
            <ChevronDown className={`w-4 h-4 text-muted-foreground ml-auto mt-1 transition-transform ${open ? "rotate-180" : ""}`} />
          </div>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
          {/* Line items */}
          <div className="space-y-1">
            {(order.items || []).map((it, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{it.listingTitle} × {it.quantity}</span>
                <span>${((it.unitPrice || 0) * (it.quantity || 1)).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Software access info — only when delivered */}
          {hasAccess ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
                <KeyRound className="w-3.5 h-3.5" /> Software Access
              </p>
              {order.delivery.accessUrl && (
                <div className="flex items-center gap-2 mb-2">
                  <a href={order.delivery.accessUrl} target="_blank" rel="noopener noreferrer"
                    className="flex-1 min-w-0 flex items-center gap-1.5 text-xs text-sky-400 hover:underline truncate">
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{order.delivery.accessUrl}</span>
                  </a>
                  <button onClick={() => copy(order.delivery.accessUrl)} className="text-muted-foreground hover:text-foreground shrink-0">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {order.delivery.instructions && (
                <p className="text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed">{order.delivery.instructions}</p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-border/30 bg-secondary/20 p-3">
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {order.status === "cancelled"
                  ? "This order was cancelled."
                  : "Your software access details will appear here once the store delivers your order."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}