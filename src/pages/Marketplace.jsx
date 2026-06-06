import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Star, TrendingUp, Clock, Gavel } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const categories = ["All", "AI & ML", "CRM", "Analytics", "E-commerce", "Marketing", "Productivity", "Finance"];

const listings = [
  { id: 1, name: "Real Estate Agent SaaS", category: "CRM", ownerPrice: 5000, sharePrice: 100, totalShares: 50, sharesSold: 32, monthlyRevenue: 1200, growth: 18, rating: 4.8, imageGradient: "from-violet-600 to-purple-700", status: "active" },
  { id: 2, name: "CRM Dashboard Pro", category: "CRM", ownerPrice: 12000, sharePrice: 250, totalShares: 48, sharesSold: 20, monthlyRevenue: 2800, growth: 24, rating: 4.9, imageGradient: "from-cyan-600 to-teal-700", status: "active" },
  { id: 3, name: "AI Content Writer", category: "AI & ML", ownerPrice: 8000, sharePrice: 100, totalShares: 80, sharesSold: 55, monthlyRevenue: 1800, growth: 32, rating: 4.7, imageGradient: "from-emerald-600 to-green-700", status: "auction" },
  { id: 4, name: "E-com Analytics Tool", category: "Analytics", ownerPrice: 3500, sharePrice: 50, totalShares: 70, sharesSold: 15, monthlyRevenue: 800, growth: 15, rating: 4.5, imageGradient: "from-amber-600 to-orange-700", status: "active" },
  { id: 5, name: "Marketing Automator", category: "Marketing", ownerPrice: 6500, sharePrice: 130, totalShares: 50, sharesSold: 40, monthlyRevenue: 1500, growth: 28, rating: 4.6, imageGradient: "from-rose-600 to-pink-700", status: "auction" },
  { id: 6, name: "Finance Tracker Pro", category: "Finance", ownerPrice: 4000, sharePrice: 80, totalShares: 50, sharesSold: 10, monthlyRevenue: 900, growth: 20, rating: 4.4, imageGradient: "from-indigo-600 to-blue-700", status: "active" },
  { id: 7, name: "Project Manager SaaS", category: "Productivity", ownerPrice: 9500, sharePrice: 190, totalShares: 50, sharesSold: 25, monthlyRevenue: 2200, growth: 22, rating: 4.8, imageGradient: "from-violet-600 to-indigo-700", status: "active" },
  { id: 8, name: "Chatbot Builder AI", category: "AI & ML", ownerPrice: 15000, sharePrice: 300, totalShares: 50, sharesSold: 30, monthlyRevenue: 3500, growth: 40, rating: 4.9, imageGradient: "from-cyan-600 to-blue-700", status: "auction" },
];

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = listings.filter((l) => {
    const catMatch = selectedCategory === "All" || l.category === selectedCategory;
    const searchMatch = l.name.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">SaaS Marketplace</h1>
        <p className="text-sm text-muted-foreground mt-1">Discover premium SaaS businesses for full ownership or fractional investment.</p>
      </motion.div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search SaaS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/50 border-border/30 rounded-xl"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <Badge
              key={c}
              variant={selectedCategory === c ? "default" : "outline"}
              className={`cursor-pointer text-xs rounded-lg px-3 py-1.5 transition-all ${
                selectedCategory === c
                  ? "bg-violet-500/20 text-violet-400 border-violet-500/30 hover:bg-violet-500/30"
                  : "border-border/40 hover:border-violet-500/20"
              }`}
              onClick={() => setSelectedCategory(c)}
            >
              {c}
            </Badge>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((l, i) => (
          <motion.div
            key={l.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300"
          >
            {/* Card Image */}
            <div className={`h-32 bg-gradient-to-br ${l.imageGradient} relative flex items-center justify-center`}>
              <div className="absolute inset-0 bg-black/20" />
              <span className="relative text-white font-display font-bold text-lg text-center px-4 leading-tight">{l.name}</span>
              {l.status === "auction" && (
                <Badge className="absolute top-3 right-3 bg-amber-500/90 text-white text-[10px] border-0">
                  <Gavel className="w-3 h-3 mr-1" /> Auction
                </Badge>
              )}
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/40 rounded-full px-2 py-0.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-white text-[10px] font-medium">{l.rating}</span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <Badge variant="outline" className="text-[10px] border-border/40">{l.category}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-secondary/40 p-2">
                  <p className="text-[10px] text-muted-foreground">Full Price</p>
                  <p className="text-sm font-display font-bold">${l.ownerPrice.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-secondary/40 p-2">
                  <p className="text-[10px] text-muted-foreground">Per Share</p>
                  <p className="text-sm font-display font-bold text-cyan-400">${l.sharePrice}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Shares Sold</span>
                  <span className="font-medium">{l.sharesSold}/{l.totalShares}</span>
                </div>
                <Progress value={(l.sharesSold / l.totalShares) * 100} className="h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-cyan-500" />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-400" /> +{l.growth}%</span>
                <span>${l.monthlyRevenue}/mo</span>
              </div>

              <div className="flex gap-2 pt-1">
                <Button size="sm" className="flex-1 bg-violet-600 hover:bg-violet-700 rounded-lg text-xs h-8">
                  Buy Shares
                </Button>
                <Button size="sm" variant="outline" className="flex-1 border-border/40 rounded-lg text-xs h-8">
                  Details
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}