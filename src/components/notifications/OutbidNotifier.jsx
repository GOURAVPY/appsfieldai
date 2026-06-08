import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Gavel } from "lucide-react";

export default function OutbidNotifier() {
  useEffect(() => {
    let myBidsCache = [];

    // Load current user's bids
    const loadMyBids = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) return;
        const user = await base44.auth.me();
        myBidsCache = await base44.entities.Bid.filter({ userId: user.id });
      } catch {
        // not logged in
      }
    };

    loadMyBids();

    // Subscribe to new bids in real-time
    const unsubscribe = base44.entities.Bid.subscribe(async (event) => {
      if (event.type !== "create") return;

      const newBid = event.data;
      if (!newBid || !newBid.listingId) return;

      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) return;
        const user = await base44.auth.me();

        // Don't notify about own bids
        if (newBid.userId === user.id) return;

        // Refresh my bids cache
        myBidsCache = await base44.entities.Bid.filter({ userId: user.id });

        // Check if I have a bid on the same listing
        const myBid = myBidsCache.find((b) => b.listingId === newBid.listingId);
        if (!myBid) return;

        // Check if I was outbid (new bid is higher than mine)
        if (newBid.bidAmount > myBid.bidAmount) {
          // Get listing title
          const listings = await base44.entities.SaaSListing.filter({ id: newBid.listingId });
          const listingTitle = listings[0]?.title || "a listing";

          // Create notification record
          await base44.entities.Notification.create({
            userId: user.id,
            type: "outbid",
            title: "You've been outbid!",
            message: `Someone bid $${newBid.bidAmount.toLocaleString()} on "${listingTitle}" — higher than your $${myBid.bidAmount.toLocaleString()} bid.`,
            listingId: newBid.listingId,
          });

          // Show toast
          toast.warning("You've been outbid!", {
            description: `$${newBid.bidAmount.toLocaleString()} on "${listingTitle}"`,
            icon: <Gavel className="w-4 h-4 text-amber-400" />,
            duration: 6000,
          });
        }
      } catch {
        // silently fail for notifications
      }
    });

    return unsubscribe;
  }, []);

  return null;
}