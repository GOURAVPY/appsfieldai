import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gavel, DollarSign, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PlaceBidModal({ listing, open, onClose, onSuccess }) {
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!listing) return null;

  const minBid = (listing.sharePrice || 10) * 0.5;
  const sharePrice = listing.sharePrice || 10;

  const handleBid = async () => {
    setError("");
    const amount = parseFloat(bidAmount);

    if (!amount || amount < minBid) {
      setError(`Minimum bid is $${minBid}`);
      return;
    }

    setLoading(true);
    await base44.entities.Bid.create({
      userId: (await base44.auth.me()).id,
      listingId: listing.id,
      bidAmount: amount,
    });

    setLoading(false);
    onSuccess?.();
    onClose();
    setBidAmount("");
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-card border border-border/40 rounded-2xl p-6 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Gavel className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="font-display font-bold text-sm">Place a Bid</h2>
                <p className="text-[11px] text-muted-foreground">{listing.title}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-secondary/40 p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Share Price</span>
                  <span className="font-medium">${sharePrice}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Minimum Bid</span>
                  <span className="font-medium text-amber-400">${minBid}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Your Bid Amount ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder={`Min $${minBid}`}
                    value={bidAmount}
                    onChange={(e) => { setBidAmount(e.target.value); setError(""); }}
                    className="pl-9 bg-secondary/60 border-border/40 rounded-xl h-10 text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-lg p-2.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                onClick={handleBid}
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl h-10 text-sm font-semibold"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Placing Bid...
                  </div>
                ) : (
                  <>
                    <Gavel className="w-4 h-4 mr-2" /> Confirm Bid
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}