import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MessageSquareText, Star, CheckCircle, XCircle, Trash2, Loader2, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const statusBadge = (status) => {
  const map = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return <Badge className={`text-[10px] border ${map[status] || ""}`}>{status}</Badge>;
};

export default function ReviewManager({ marketplaceId }) {
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(null);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", marketplaceId],
    queryFn: () => base44.entities.Review.filter({ marketplaceId }, "-created_date"),
    enabled: !!marketplaceId,
  });

  const handleAction = async (review, status) => {
    setActionLoading(review.id);
    await base44.entities.Review.update(review.id, { status });
    queryClient.invalidateQueries({ queryKey: ["reviews", marketplaceId] });
    setActionLoading(null);
    toast.success(`Review ${status}.`);
  };

  const handleFeatureToggle = async (review) => {
    await base44.entities.Review.update(review.id, { featured: !review.featured });
    queryClient.invalidateQueries({ queryKey: ["reviews", marketplaceId] });
    toast.success(`Review ${review.featured ? "unfeatured" : "featured"}.`);
  };

  const handleDelete = async (review) => {
    setActionLoading(review.id);
    await base44.entities.Review.delete(review.id);
    queryClient.invalidateQueries({ queryKey: ["reviews", marketplaceId] });
    setActionLoading(null);
    toast.success("Review deleted.");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold flex items-center gap-2">
          <MessageSquareText className="w-5 h-5 text-yellow-400" /> Reviews
        </h3>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">No reviews yet.</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {reviews.map((r) => (
            <div key={r.id} className="bg-card/40 border border-border/40 rounded-xl p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">{r.userName || "Anonymous"}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < (r.rating || 0) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    {r.featured && <Pin className="w-3 h-3 text-amber-400" />}
                  </div>
                  {r.title && <p className="text-xs font-medium">{r.title}</p>}
                  <p className="text-xs text-muted-foreground line-clamp-2">{r.content}</p>
                  <p className="text-[9px] text-muted-foreground mt-1">{r.softwareName} · {new Date(r.created_date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {statusBadge(r.status)}
                  {r.status === "pending" && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => handleAction(r, "approved")} disabled={actionLoading === r.id} className="h-7 w-7 p-0 text-emerald-400"><CheckCircle className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleAction(r, "rejected")} disabled={actionLoading === r.id} className="h-7 w-7 p-0 text-red-400"><XCircle className="w-3.5 h-3.5" /></Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleFeatureToggle(r)} className={`h-7 w-7 p-0 ${r.featured ? "text-amber-400" : "text-muted-foreground"}`}><Pin className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(r)} disabled={actionLoading === r.id} className="h-7 w-7 p-0 text-red-400"><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}