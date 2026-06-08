import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import AuctionCard from "@/components/landing/AuctionCard";
import Footer from "@/components/landing/Footer";

const demoListings = [
  {
    id: 1, name: "Real Estate Agent SaaS", category: "Real Estate",
    fullPrice: 5000, sharePrice: 100, totalSlots: 50, soldSlots: 32,
    monthlyRevenue: 1200, endsAt: "2026-06-10T18:00:00",
  },
  {
    id: 2, name: "AI Voice Agent", category: "AI Tools",
    fullPrice: 12000, sharePrice: 250, totalSlots: 48, soldSlots: 20,
    monthlyRevenue: 2800, endsAt: "2026-06-12T14:00:00",
  },
  {
    id: 3, name: "Marketing Automator", category: "Marketing",
    fullPrice: 8000, sharePrice: 160, totalSlots: 50, soldSlots: 18,
    monthlyRevenue: 1800, endsAt: "2026-06-11T22:00:00",
  },
  {
    id: 4, name: "CRM Dashboard Pro", category: "CRM",
    fullPrice: 10000, sharePrice: 200, totalSlots: 50, soldSlots: 30,
    monthlyRevenue: 2400, endsAt: "2026-06-14T08:00:00",
  },
];

const categories = ["All Categories", "Real Estate", "AI Tools", "Marketing", "CRM"];
const sortOptions = [
  { label: "Newest", key: "newest" },
  { label: "Auction Ending Soon", key: "ending" },
  { label: "Highest Revenue", key: "revenue" },
  { label: "Lowest Price", key: "price" },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [sort, setSort] = useState("newest");

  const sorted = [...demoListings]
    .filter((l) => {
      const catMatch = category === "All Categories" || l.category === category;
      const searchMatch = l.name.toLowerCase().includes(search.toLowerCase());
      return catMatch && searchMatch;
    })
    .sort((a, b) => {
      if (sort === "ending") return new Date(a.endsAt) - new Date(b.endsAt);
      if (sort === "revenue") return b.monthlyRevenue - a.monthlyRevenue;
      if (sort === "price") return a.sharePrice - b.sharePrice;
      return b.id - a.id;
    });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />

      {/* Marketplace Section */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-display font-bold">Live SaaS Auctions</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
              Browse active software deals, lock your share, or buy the full SaaS before the auction ends.
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-3 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search SaaS deals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary/50 border-cyan-500/20 rounded-xl h-10 text-sm focus:border-cyan-500/50"
              />
            </div>

            {/* Category filter */}
            <div className="flex gap-1.5 flex-wrap">
              {categories.map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant={category === c ? "default" : "ghost"}
                  onClick={() => setCategory(c)}
                  className={`rounded-xl text-xs h-9 px-3 ${
                    category === c
                      ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {c}
                </Button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex gap-1.5 flex-wrap">
              {sortOptions.map((s) => (
                <Button
                  key={s.key}
                  size="sm"
                  variant={sort === s.key ? "default" : "ghost"}
                  onClick={() => setSort(s.key)}
                  className={`rounded-xl text-xs h-9 px-3 ${
                    sort === s.key
                      ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <SlidersHorizontal className="w-3 h-3 mr-1 opacity-50" />
                  {s.label}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sorted.map((listing, i) => (
              <AuctionCard
                key={listing.id}
                listing={listing}
                index={i}
              />
            ))}
          </div>

          {sorted.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-display">No deals found</p>
              <p className="text-sm mt-1">Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}