import React from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, TrendingUp, Clock, Gavel, Users, Shield, Zap, Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const listingData = {
  id: 1,
  name: "Real Estate Agent SaaS",
  category: "CRM",
  description: "A complete CRM solution built specifically for real estate agents. Features include lead management, automated follow-ups, property listing integration, and transaction tracking. Proven revenue with 120+ active agencies using the platform.",
  ownerPrice: 5000,
  sharePrice: 100,
  totalShares: 50,
  sharesSold: 32,
  monthlyRevenue: 1200,
  growth: 18,
  rating: 4.8,
  reviews: 34,
  imageGradient: "from-violet-600 via-purple-700 to-indigo-800",
  status: "active",
  seller: "TechVentures Inc.",
  listedDate: "2026-05-15",
  features: ["Lead Management", "Automated Follow-ups", "Property Listings", "Transaction Tracking", "Analytics Dashboard", "Email Integration"],
  tags: ["CRM", "Real Estate", "B2B", "Subscription"],
  auctionEnds: null,
};

const activityLog = [
  { user: "Sarah M.", action: "bought 5 shares", time: "2 hours ago", amount: "$500" },
  { user: "James K.", action: "bought 2 shares", time: "5 hours ago", amount: "$200" },
  { user: "Maria L.", action: "bought 10 shares", time: "1 day ago", amount: "$1,000" },
  { user: "David R.", action: "bought 3 shares", time: "2 days ago", amount: "$300" },
];

export default function SaaDetail() {
  const { id } = useParams();
  const listing = listingData;

  return (
    <div className="space-y-6 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold">{listing.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant="outline" className="text-[10px] border-border/40">{listing.category}</Badge>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-medium">{listing.rating}</span>
              <span className="text-muted-foreground">({listing.reviews} reviews)</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`h-64 rounded-2xl bg-gradient-to-br ${listing.imageGradient} flex items-center justify-center relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative text-center">
              <h2 className="text-3xl font-display font-bold text-white">{listing.name}</h2>
              <p className="text-white/70 mt-1">{listing.category} Solution</p>
            </div>
          </motion.div>

          {/* Description */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
            <CardHeader><CardTitle className="text-base font-display">About This SaaS</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{listing.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {listing.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
            <CardHeader><CardTitle className="text-base font-display">Key Features</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {listing.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-violet-400" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
            <CardHeader><CardTitle className="text-base font-display">Recent Activity</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border/30">
              {activityLog.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm"><span className="font-medium">{a.user}</span> {a.action}</p>
                    <p className="text-[11px] text-muted-foreground">{a.time}</p>
                  </div>
                  <span className="text-sm font-medium text-emerald-400">{a.amount}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="border-violet-500/20 bg-card/60 backdrop-blur-xl sticky top-24">
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-xl bg-secondary/40 p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Full Price</p>
                    <p className="text-xl font-display font-bold mt-1">${listing.ownerPrice.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl bg-secondary/40 p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Per Share</p>
                    <p className="text-xl font-display font-bold text-cyan-400 mt-1">${listing.sharePrice}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Shares Available</span>
                    <span className="font-medium">{listing.totalShares - listing.sharesSold} of {listing.totalShares}</span>
                  </div>
                  <Progress value={(listing.sharesSold / listing.totalShares) * 100} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-cyan-500" />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Revenue</span>
                    <span className="font-medium">${listing.monthlyRevenue}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Growth Rate</span>
                    <span className="font-medium text-emerald-400">+{listing.growth}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seller</span>
                    <span className="font-medium">{listing.seller}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl h-10 font-semibold text-sm">
                      <Gavel className="w-4 h-4 mr-2" /> Buy Shares
                    </Button>
                    <Button variant="outline" size="icon" className="border-border/40 rounded-xl h-10 w-10">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full border-violet-500/20 text-violet-400 hover:bg-violet-500/10 rounded-xl h-10 text-sm">
                    Buy Full Ownership — ${listing.ownerPrice.toLocaleString()}
                  </Button>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] text-muted-foreground">Verified & Secured by SaaSShare</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}