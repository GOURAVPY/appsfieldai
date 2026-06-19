import React, { useState, useEffect } from "react";
import { X, Loader2, CalendarCheck, Minus, Plus } from "lucide-react";
import { reserveStoreSpot } from "@/lib/storeCustomerAuth";
import { toast } from "sonner";

// Store-scoped reserve flow — records the reservation against the logged-in
// StoreCustomer (not an app user), so it shows up in My Products and My Customers.
export default function StoreReserveModal({ open, onClose, listing, marketplaceId, customer, brandColor = "#f97316", onReserved }) {
  const [spots, setSpots] = useState(1);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSpots(1);
      setPhone(customer?.phone || "");
      setMessage("");
    }
  }, [open, customer]);

  if (!open || !listing) return null;

  const isSingle = listing.dealType === "single_purchase";
  const perSpot = isSingle
    ? (listing.sharePrice || 0) * (listing.totalShares || 0)
    : (listing.sharePrice || 0);
  const spotsLeft = isSingle ? 1 : Math.max(0, (listing.totalShares || 0) - (listing.soldShares || 0));
  const amountDue = perSpot * spots;

  const submit = async () => {
    setLoading(true);
    try {
      await reserveStoreSpot({ marketplaceId, listingId: listing.id, spots, phone, message });
      toast.success("Spot reserved! Check My Products for your amount due.");
      onReserved?.();
      onClose();
    } catch (e) {
      toast.error(e.message || "Could not reserve. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-card border border-border/40 rounded-2xl p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: brandColor }}>
            <CalendarCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-display font-bold leading-tight">Reserve a Spot</h2>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{listing.softwareName}</p>
          </div>
        </div>

        {!isSingle && (
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-1.5 block">How many spots?</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setSpots((s) => Math.max(1, s - 1))} disabled={spots <= 1}
                className="w-9 h-9 rounded-lg border border-border/40 flex items-center justify-center disabled:opacity-40 hover:bg-secondary/50">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-lg font-display font-bold">{spots}</span>
              <button onClick={() => setSpots((s) => Math.min(spotsLeft || 1, s + 1))} disabled={spots >= (spotsLeft || 1)}
                className="w-9 h-9 rounded-lg border border-border/40 flex items-center justify-center disabled:opacity-40 hover:bg-secondary/50">
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted-foreground ml-1">{spotsLeft} left</span>
            </div>
          </div>
        )}

        <div className="mb-3">
          <label className="text-xs text-muted-foreground mb-1.5 block">Phone (optional)</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone number"
            className="w-full px-3 py-2.5 rounded-xl bg-secondary/60 border border-border/40 text-sm focus:outline-none" />
        </div>

        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1.5 block">Message (optional)</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Any notes for the seller..."
            className="w-full px-3 py-2.5 rounded-xl bg-secondary/60 border border-border/40 text-sm h-20 resize-none focus:outline-none" />
        </div>

        <div className="flex items-center justify-between rounded-xl bg-secondary/40 px-4 py-3 mb-4">
          <span className="text-sm text-muted-foreground">Amount due</span>
          <span className="text-lg font-display font-bold" style={{ color: brandColor }}>${amountDue.toLocaleString()}</span>
        </div>

        <button onClick={submit} disabled={loading || (!isSingle && spotsLeft <= 0)}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: brandColor }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
          Confirm Reservation
        </button>
        <p className="text-[11px] text-muted-foreground text-center mt-3">
          Payment becomes due once the deal fills up. The store will confirm your payment.
        </p>
      </div>
    </div>
  );
}