import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, DollarSign, Share2, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SellMySaaS() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    category: "CRM",
    ownerPrice: "",
    sharePrice: "",
    totalShares: "50",
    monthlyRevenue: "",
    growthRate: "",
    description: "",
    features: "",
    sellerName: "",
  });

  const updateForm = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Sell My SaaS</h1>
        <p className="text-sm text-muted-foreground mt-1">List your SaaS business for full sale or fractional ownership.</p>
      </motion.div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              step >= s ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white" : "bg-secondary/50 text-muted-foreground"
            }`}>
              {step > s ? <CheckCircle className="w-4 h-4" /> : s}
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 rounded ${step > s ? "bg-violet-500" : "bg-secondary/50"}`} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base font-display">SaaS Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">SaaS Name</Label>
                <Input value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="e.g., Real Estate Agent SaaS" className="bg-secondary/50 border-border/30 rounded-xl" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Category</Label>
                  <select value={form.category} onChange={(e) => updateForm("category", e.target.value)} className="w-full h-9 rounded-xl bg-secondary/50 border border-border/30 px-3 text-sm">
                    {["CRM", "AI & ML", "Analytics", "E-commerce", "Marketing", "Productivity", "Finance"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Seller Name</Label>
                  <Input value={form.sellerName} onChange={(e) => updateForm("sellerName", e.target.value)} placeholder="Your name or company" className="bg-secondary/50 border-border/30 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Description</Label>
                <Textarea value={form.description} onChange={(e) => updateForm("description", e.target.value)} placeholder="Describe your SaaS business..." className="bg-secondary/50 border-border/30 rounded-xl h-24" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Key Features (comma separated)</Label>
                <Input value={form.features} onChange={(e) => updateForm("features", e.target.value)} placeholder="Lead Management, Analytics, Email Integration" className="bg-secondary/50 border-border/30 rounded-xl" />
              </div>
              <Button onClick={() => setStep(2)} className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl">Next Step</Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base font-display">Pricing & Shares</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Full Ownership Price ($)</Label>
                  <Input type="number" value={form.ownerPrice} onChange={(e) => updateForm("ownerPrice", e.target.value)} placeholder="5000" className="bg-secondary/50 border-border/30 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Price Per Share ($)</Label>
                  <Input type="number" value={form.sharePrice} onChange={(e) => updateForm("sharePrice", e.target.value)} placeholder="100" className="bg-secondary/50 border-border/30 rounded-xl" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Total Shares</Label>
                  <Input type="number" value={form.totalShares} onChange={(e) => updateForm("totalShares", e.target.value)} placeholder="50" className="bg-secondary/50 border-border/30 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Monthly Revenue ($)</Label>
                  <Input type="number" value={form.monthlyRevenue} onChange={(e) => updateForm("monthlyRevenue", e.target.value)} placeholder="1200" className="bg-secondary/50 border-border/30 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Annual Growth Rate (%)</Label>
                <Input type="number" value={form.growthRate} onChange={(e) => updateForm("growthRate", e.target.value)} placeholder="18" className="bg-secondary/50 border-border/30 rounded-xl" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="border-border/40 rounded-xl">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl">Next Step</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base font-display">Review & Submit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-secondary/30 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{form.name || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{form.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Full Price</span>
                  <span className="font-medium">${Number(form.ownerPrice || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Share Price × {form.totalShares} shares</span>
                  <span className="font-medium">${form.sharePrice || "0"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Revenue</span>
                  <span className="font-medium text-emerald-400">${Number(form.monthlyRevenue || 0).toLocaleString()}/mo</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="border-border/40 rounded-xl">Back</Button>
                <Button className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-xl">
                  <Upload className="w-4 h-4 mr-2" /> List My SaaS
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="flex items-start gap-3 p-4 rounded-xl border border-violet-500/20 bg-violet-500/5">
        <Info className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Listing Guidelines</p>
          All SaaS listings are reviewed within 24 hours. You must verify revenue through bank statements or payment processor screenshots. SaaSShare charges a 5% commission on completed sales.
        </div>
      </div>
    </div>
  );
}