import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Building2, CheckCircle, Ban, Phone, TrendingUp, BadgeCheck, Trash2, Mail, Copy, Check, DollarSign, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statusConfig = {
  pending: { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Building2, label: "Pending" },
  approved: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle, label: "Approved" },
  rejected: { color: "bg-red-500/10 text-red-400 border-red-500/20", icon: Ban, label: "Rejected" },
  contacted: { color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", icon: Phone, label: "Contacted" },
  deal_in_progress: { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: TrendingUp, label: "In Progress" },
  deal_closed: { color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: BadgeCheck, label: "Closed" },
  cancelled: { color: "bg-muted text-muted-foreground border-border/30", icon: Ban, label: "Cancelled" },
};

export default function AcquisitionRequestsManager() {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState({});

  const { data: acquisitions = [], isLoading } = useQuery({
    queryKey: ["allAcquisitions"],
    queryFn: () => base44.entities.AcquisitionRequests.list("-created_date", 100),
  });

  const { data: allListings = [] } = useQuery({
    queryKey: ["allListings"],
    queryFn: () => base44.entities.SaaSListing.list(),
  });

  const listingMap = {};
  allListings.forEach((l) => {
    listingMap[l.id] = l;
  });

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopied((p) => ({ ...p, [key]: true }));
    setTimeout(() => setCopied((p) => ({ ...p, [key]: false })), 1500);
  };

  const handleStatusChange = async (acquisition, newStatus) => {
    await base44.entities.AcquisitionRequests.update(acquisition.id, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ["allAcquisitions"] });
    toast.success(`Acquisition request ${newStatus.replace("_", " ")}`);

    // Send notification to user
    try {
      await base44.entities.Notification.create({
        userId: acquisition.userId,
        role: "user",
        type: newStatus === "approved" ? "request_approved" : newStatus === "rejected" ? "request_rejected" : "request_contacted",
        title: `Acquisition Request ${newStatus === "approved" ? "Approved" : newStatus === "rejected" ? "Rejected" : "Updated"}`,
        message: `Your acquisition request for "${acquisition.listingTitle || "the listing"}" has been ${newStatus.replace("_", " ")}.`,
        listingId: acquisition.listingId,
        relatedRequestId: acquisition.id,
        isRead: false,
      });
    } catch (_) {}

    // Notify admin
    try {
      await base44.functions.invoke("notifyUserApproval", {
        userEmail: acquisition.userEmail,
        userName: acquisition.userName,
        listingTitle: acquisition.listingTitle,
        requestType: "acquisition_request",
        status: newStatus,
        listingId: acquisition.listingId,
        userId: acquisition.userId,
        phone: acquisition.phone,
        offerAmount: acquisition.offerAmount,
        notes: acquisition.notes,
      });
    } catch (_) {}
  };

  const handleDelete = async (acquisition) => {
    await base44.entities.AcquisitionRequests.delete(acquisition.id);
    queryClient.invalidateQueries({ queryKey: ["allAcquisitions"] });
    toast.success("Acquisition request deleted");
  };

  const statusBadge = (s) => {
    const cfg = statusConfig[s] || statusConfig.pending;
    const Icon = cfg.icon;
    return (
      <Badge className={`text-[10px] border ${cfg.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {cfg.label}
      </Badge>
    );
  };

  const getListingName = (a) => {
    if (a.listingTitle) return a.listingTitle;
    const listing = listingMap[a.listingId];
    return listing?.softwareName || listing?.name || "Untitled Listing";
  };

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border/40 bg-[#1a1a1a]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-display flex items-center gap-2 text-foreground">
              <Building2 className="w-4 h-4 text-violet-400" />
              Acquisition Requests
              <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-[10px] ml-2">
                {acquisitions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/20">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
              </div>
            ) : acquisitions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No acquisition requests yet</p>
            ) : (
              acquisitions.map((a) => (
                <div key={a.id} className="flex items-start justify-between py-3 first:pt-0 last:pb-0 gap-3">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{a.userName || "Unknown"}</p>
                      <span className="text-xs text-muted-foreground">{a.userEmail}</span>
                      <div className="flex items-center gap-0.5 ml-1">
                        {a.userEmail && (
                          <>
                            <a href={`mailto:${a.userEmail}`} className="p-1 rounded hover:bg-secondary/50 text-muted-foreground hover:text-foreground">
                              <Mail className="w-3 h-3" />
                            </a>
                            <button
                              onClick={() => handleCopy(`ae-${a.id}`, a.userEmail)}
                              className="p-1 rounded hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                            >
                              {copied[`ae-${a.id}`] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-violet-400">{getListingName(a)}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {a.offerAmount > 0 && (
                        <span className="text-[11px] text-amber-400 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />${a.offerAmount?.toLocaleString()}
                        </span>
                      )}
                      {statusBadge(a.status)}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(a.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    {a.notes && (
                      <div className="flex items-start gap-1 text-[11px] text-muted-foreground">
                        <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{a.notes}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                    {a.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(a, "approved")}
                          className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 h-7 text-[11px]"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(a, "contacted")}
                          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 h-7 text-[11px]"
                        >
                          <Phone className="w-3 h-3 mr-1" /> Contacted
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(a, "rejected")}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 text-[11px]"
                        >
                          <Ban className="w-3 h-3 mr-1" /> Reject
                        </Button>
                      </>
                    )}
                    {a.status === "approved" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(a, "contacted")}
                          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 h-7 text-[11px]"
                        >
                          <Phone className="w-3 h-3 mr-1" /> Contacted
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(a, "deal_in_progress")}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-7 text-[11px]"
                        >
                          <TrendingUp className="w-3 h-3 mr-1" /> In Progress
                        </Button>
                      </>
                    )}
                    {a.status === "contacted" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(a, "deal_in_progress")}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-7 text-[11px]"
                        >
                          <TrendingUp className="w-3 h-3 mr-1" /> In Progress
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(a, "deal_closed")}
                          className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 h-7 text-[11px]"
                        >
                          <BadgeCheck className="w-3 h-3 mr-1" /> Close Deal
                        </Button>
                      </>
                    )}
                    {a.status === "deal_in_progress" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusChange(a, "deal_closed")}
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 h-7 text-[11px]"
                      >
                        <BadgeCheck className="w-3 h-3 mr-1" /> Close Deal
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(a)}
                      className="text-red-400/50 hover:text-red-400 hover:bg-red-500/10 h-7 text-[11px]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}