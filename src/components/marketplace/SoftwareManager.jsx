import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Package, Plus, Edit3, Trash2, CheckCircle, XCircle, Star, Loader2, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const statusBadge = (status) => {
  const map = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    suspended: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    auction: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    sold: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };
  return <Badge className={`text-[10px] border ${map[status] || ""}`}>{status}</Badge>;
};

export default function SoftwareManager({ marketplaceId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["softwareListings", marketplaceId],
    queryFn: () => base44.entities.SaaSListing.filter({ marketplaceId }),
    enabled: !!marketplaceId,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["softwareCategories", marketplaceId],
    queryFn: () => base44.entities.SoftwareCategory.filter({ marketplaceId }),
    enabled: !!marketplaceId,
  });

  const handleAction = async (listing, status) => {
    setActionLoading(listing.id);
    await base44.entities.SaaSListing.update(listing.id, { status });
    queryClient.invalidateQueries({ queryKey: ["softwareListings", marketplaceId] });
    setActionLoading(null);
    toast.success(`${listing.softwareName || listing.title} ${status}.`);
  };

  const handleFeatureToggle = async (listing) => {
    await base44.entities.SaaSListing.update(listing.id, { featured: !listing.featured });
    queryClient.invalidateQueries({ queryKey: ["softwareListings", marketplaceId] });
    toast.success(`${listing.softwareName || listing.title} ${listing.featured ? "unfeatured" : "featured"}.`);
  };

  const handleDelete = async (listing) => {
    setActionLoading(listing.id);
    await base44.entities.SaaSListing.delete(listing.id);
    queryClient.invalidateQueries({ queryKey: ["softwareListings", marketplaceId] });
    setActionLoading(null);
    toast.success("Software deleted.");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-semibold flex items-center gap-2">
          <Package className="w-5 h-5 text-violet-400" /> Software Listings
        </h3>
        <Button size="sm" onClick={() => { setEditing(null); setShowForm(true); }} className="bg-violet-600 hover:bg-violet-700 rounded-xl text-xs h-8">
          <Plus className="w-3 h-3 mr-1" /> Add Software
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">No software listings.</div>
      ) : (
        <div className="space-y-2">
          {listings.map((item) => (
            <div key={item.id} className="bg-card/40 border border-border/40 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4 text-violet-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.softwareName || item.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>${(item.price || item.fullPrice || 0).toLocaleString()}</span>
                    {item.pricingType && <span className="capitalize">· {item.pricingType.replace(/_/g, " ")}</span>}
                    {item.vendorId && <span>· Vendor</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {statusBadge(item.status)}
                {item.featured && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                <div className="flex gap-1">
                  {item.status === "pending" && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => handleAction(item, "approved")} disabled={actionLoading === item.id} className="h-7 w-7 p-0 text-emerald-400"><CheckCircle className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleAction(item, "rejected")} disabled={actionLoading === item.id} className="h-7 w-7 p-0 text-red-400"><XCircle className="w-3.5 h-3.5" /></Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleFeatureToggle(item)} className={`h-7 w-7 p-0 ${item.featured ? "text-amber-400" : "text-muted-foreground"}`}><Star className="w-3.5 h-3.5" /></Button>
                  <Link to={`/saas/${item.id}`} target="_blank"><Button size="sm" variant="ghost" className="h-7 w-7 p-0"><ExternalLink className="w-3.5 h-3.5" /></Button></Link>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(item)} disabled={actionLoading === item.id} className="h-7 w-7 p-0 text-red-400"><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}