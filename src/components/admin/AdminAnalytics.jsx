import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Eye, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analyticsData"],
    queryFn: async () => {
      const response = await base44.functions.invoke("getAnalytics", {});
      return response.data;
    },
  });

  const totalViews = analytics?.totalViews || 0;
  const totalReservations = analytics?.totalReservations || 0;
  const totalAcquisitions = analytics?.totalAcquisitions || 0;
  const totalBids = analytics?.totalBids || 0;
  const totalDemos = analytics?.totalDemos || 0;
  const totalRequests = analytics?.totalRequests || 0;
  const conversionRate = analytics?.conversionRate || 0;
  const activeListings = analytics?.activeListings || 0;
  const topListings = analytics?.topListings || [];
  const recentActivity = analytics?.recentActivity || [];

  const getEventIcon = (type) => {
    const icons = { listing_view: "👁️", reserve_spot_submit: "🎯", acquisition_request_submit: "💰", bid_submit: "📈", demo_request_submit: "📅", admin_approve: "✅", admin_reject: "❌" };
    return icons[type] || "📊";
  };

  const getEventColor = (type) => {
    const colors = {
      listing_view: "bg-blue-500/20 text-blue-400",
      reserve_spot_submit: "bg-violet-500/20 text-violet-400",
      acquisition_request_submit: "bg-amber-500/20 text-amber-400",
      bid_submit: "bg-cyan-500/20 text-cyan-400",
      demo_request_submit: "bg-pink-500/20 text-pink-400",
      admin_approve: "bg-emerald-500/20 text-emerald-400",
      admin_reject: "bg-red-500/20 text-red-400",
    };
    return colors[type] || "bg-secondary text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Analytics Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Track user engagement and conversion metrics.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Views", value: totalViews, icon: Eye, color: "blue" },
          { label: "Total Requests", value: totalRequests, icon: ShoppingCart, color: "violet" },
          { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp, color: "emerald" },
          { label: "Active Listings", value: analytics?.activeListings || 0, icon: Users, color: "amber" },
        ].map((metric, i) => (
          <motion.div key={metric.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-display font-bold">{metric.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-${metric.color}-500/10 flex items-center justify-center`}>
                    <metric.icon className={`w-5 h-5 text-${metric.color}-400`} />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Listings */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base font-display">Top Listings by Views</CardTitle>
          </CardHeader>
          <CardContent>
            {topListings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No views yet</p>
            ) : (
              <div className="space-y-3">
                {topListings.map((item, i) => (
                  <motion.div key={item.listingId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.views} views</p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">#{i + 1}</Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Breakdown */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base font-display">Request Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Reserve Spots", value: totalReservations },
                { label: "Acquisitions", value: totalAcquisitions },
                { label: "Bids", value: totalBids },
                { label: "Demo Requests", value: totalDemos },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30">
                  <span className="text-sm">{item.label}</span>
                  <Badge className="bg-primary/10 text-primary border-primary/20">{item.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base font-display">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((event, i) => (
                <motion.div key={event.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${getEventColor(event.eventType)}`}>
                    {getEventIcon(event.eventType)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.eventType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(event.createdAt).toLocaleString()}
                      {event.listingId && ` • ${event.listingTitle || "Listing"}`}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}