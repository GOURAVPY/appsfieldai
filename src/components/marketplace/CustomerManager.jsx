import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Users, Loader2, Download, Mail, Phone, CalendarCheck, CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STATUS_STYLES = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  approved: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  contacted: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  fulfilled: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-muted text-muted-foreground border-border/40",
};

function CustomerCard({ c, onApprove, approvingId }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card/40 border border-border/40 rounded-xl overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between p-3 text-left hover:bg-secondary/30 transition-colors">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{c.fullName || "Customer"}</p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
            {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-sm font-semibold text-orange-400">${c.amountDue.toLocaleString()} due</p>
            <p className="text-[9px] text-muted-foreground">{c.reservationCount} reservation{c.reservationCount !== 1 ? "s" : ""}</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="border-t border-border/30 p-3 space-y-2 bg-background/40">
          {c.reservations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">No reservations.</p>
          ) : (
            c.reservations.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2 rounded-lg bg-card/50 border border-border/30 p-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate flex items-center gap-1.5">
                    <CalendarCheck className="w-3 h-3 text-orange-400" /> {r.listingTitle}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {r.spots} spot{r.spots > 1 ? "s" : ""} · ${r.amountDue.toLocaleString()}
                    <span className={`ml-2 px-1.5 py-0.5 rounded-full border text-[9px] ${STATUS_STYLES[r.status] || STATUS_STYLES.pending}`}>{r.status}</span>
                  </p>
                </div>
                {r.paymentApproved ? (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                  </span>
                ) : (
                  <Button size="sm" onClick={() => onApprove(r.id)} disabled={approvingId === r.id}
                    className="h-7 text-[11px] rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border-0 shrink-0">
                    {approvingId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve Payment"}
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function CustomerManager({ marketplaceId }) {
  const queryClient = useQueryClient();
  const [approvingId, setApprovingId] = useState(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["storeCustomers", marketplaceId],
    queryFn: async () => {
      const res = await base44.functions.invoke("getStoreCustomers", { marketplaceId });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data.customers || [];
    },
    enabled: !!marketplaceId,
  });

  const handleApprove = async (reservationId) => {
    setApprovingId(reservationId);
    try {
      const res = await base44.functions.invoke("approveReservationPayment", { reservationId, approved: true });
      if (res.data?.error) throw new Error(res.data.error);
      toast.success("Payment approved.");
      queryClient.invalidateQueries({ queryKey: ["storeCustomers", marketplaceId] });
    } catch (e) {
      toast.error(e.message || "Could not approve payment.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleExport = () => {
    const csv = "Name,Email,Phone,Reservations,Amount Due,Amount Paid\n" +
      customers.map(c => `"${c.fullName}","${c.email}","${c.phone || ""}",${c.reservationCount},${c.amountDue},${c.amountPaid}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "store-customers.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Customers exported.");
  };

  const totalDue = customers.reduce((s, c) => s + c.amountDue, 0);
  const totalPaid = customers.reduce((s, c) => s + c.amountPaid, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-green-400" /> My Customers
        </h3>
        <Button size="sm" variant="outline" onClick={handleExport} disabled={customers.length === 0} className="rounded-xl text-xs h-8">
          <Download className="w-3 h-3 mr-1" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-violet-500/5 border border-violet-500/10 rounded-xl p-3 text-center">
          <p className="text-lg font-display font-bold">{customers.length}</p>
          <p className="text-[10px] text-muted-foreground">Customers</p>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-center">
          <p className="text-lg font-display font-bold">${totalDue.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Amount Due</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-center">
          <p className="text-lg font-display font-bold">${totalPaid.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Collected</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : customers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">No customers have signed up yet.</div>
      ) : (
        <div className="space-y-2 max-h-[28rem] overflow-y-auto">
          {customers.map((c) => (
            <CustomerCard key={c.id} c={c} onApprove={handleApprove} approvingId={approvingId} />
          ))}
        </div>
      )}
    </div>
  );
}