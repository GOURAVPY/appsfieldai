import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, Package, ShoppingCart, Wallet, TicketPercent, MessageSquareText, Video, Users, Tags, Settings, Store, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SoftwareManager from "@/components/marketplace/SoftwareManager";
import OrderManager from "@/components/marketplace/OrderManager";
import PayoutManager from "@/components/marketplace/PayoutManager";
import CouponManager from "@/components/marketplace/CouponManager";
import ReviewManager from "@/components/marketplace/ReviewManager";
import DemoRequestManager from "@/components/marketplace/DemoRequestManager";
import CustomerManager from "@/components/marketplace/CustomerManager";
import CategoryManager from "@/components/marketplace/CategoryManager";
import VendorManagement from "@/components/vendor/VendorManagement";
import LedgerManager from "@/components/marketplace/LedgerManager";

const tabs = [
  { key: "software", label: "Software", icon: Package, color: "text-violet-400" },
  { key: "vendors", label: "Vendors", icon: Users, color: "text-cyan-400" },
  { key: "orders", label: "Orders", icon: ShoppingCart, color: "text-emerald-400" },
  { key: "payouts", label: "Payouts", icon: Wallet, color: "text-amber-400" },
  { key: "coupons", label: "Coupons", icon: TicketPercent, color: "text-pink-400" },
  { key: "reviews", label: "Reviews", icon: MessageSquareText, color: "text-yellow-400" },
  { key: "demos", label: "Demos", icon: Video, color: "text-blue-400" },
  { key: "customers", label: "Customers", icon: Users, color: "text-green-400" },
  { key: "categories", label: "Categories", icon: Tags, color: "text-teal-400" },
  { key: "ledger", label: "Audit Log", icon: ScrollText, color: "text-orange-400" },
];

export default function AdminHub() {
  const { marketplaceId } = useParams();
  const [activeTab, setActiveTab] = useState("software");

  const { data: marketplace } = useQuery({
    queryKey: ["adminMarketplace", marketplaceId],
    queryFn: () => base44.entities.Marketplace.get(marketplaceId),
    enabled: !!marketplaceId,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ["adminListingsCount", marketplaceId],
    queryFn: () => base44.entities.SaaSListing.filter({ marketplaceId }),
    enabled: !!marketplaceId,
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["adminVendorsCount", marketplaceId],
    queryFn: () => base44.entities.Vendor.filter({ marketplaceId }),
    enabled: !!marketplaceId,
  });

  const pendingListings = listings.filter(l => l.status === "pending").length;
  const pendingVendors = vendors.filter(v => v.status === "pending").length;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">{marketplace?.name || "Admin Hub"}</h1>
              <p className="text-xs text-muted-foreground">Manage your marketplace</p>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 mt-3 flex-wrap">
          <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-xs px-3 py-1">{listings.length} Software</Badge>
          <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-xs px-3 py-1">{vendors.length} Vendors</Badge>
          {pendingListings > 0 && <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs px-3 py-1">{pendingListings} Pending Listings</Badge>}
          {pendingVendors > 0 && <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs px-3 py-1">{pendingVendors} Pending Vendors</Badge>}
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-1.5 flex-wrap border-b border-border/40 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {activeTab === "software" && <SoftwareManager marketplaceId={marketplaceId} />}
        {activeTab === "vendors" && <VendorManagement marketplaceId={marketplaceId} />}
        {activeTab === "orders" && <OrderManager marketplaceId={marketplaceId} />}
        {activeTab === "payouts" && <PayoutManager marketplaceId={marketplaceId} />}
        {activeTab === "coupons" && <CouponManager marketplaceId={marketplaceId} />}
        {activeTab === "reviews" && <ReviewManager marketplaceId={marketplaceId} />}
        {activeTab === "demos" && <DemoRequestManager marketplaceId={marketplaceId} />}
        {activeTab === "customers" && <CustomerManager marketplaceId={marketplaceId} />}
        {activeTab === "categories" && <CategoryManager marketplaceId={marketplaceId} />}
        {activeTab === "ledger" && <LedgerManager marketplaceId={marketplaceId} />}
      </motion.div>
    </div>
  );
}