import React from "react";
import { motion } from "framer-motion";
import { Gavel, Clock, TrendingUp, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

const auctions = [
  { id: 1, name: "AI Content Writer", category: "AI & ML", currentBid: 2400, sharePrice: 100, totalShares: 80, sharesSold: 55, bids: 18, endTime: "2d 14h 32m", imageGradient: "from-emerald-600 to-green-700", hot: true },
  { id: 2, name: "Marketing Automator", category: "Marketing", currentBid: 1800, sharePrice: 130, totalShares: 50, sharesSold: 40, bids: 12, endTime: "4h 18m", imageGradient: "from-rose-600 to-pink-700", hot: true },
  { id: 3, name: "Chatbot Builder AI", category: "AI & ML", currentBid: 5800, sharePrice: 300, totalShares: 50, sharesSold: 30, bids: 24, endTime: "1d 6h", imageGradient: "from-cyan-600 to-blue-700", hot: false },
  { id: 4, name: "Analytics Dashboard", category: "Analytics", currentBid: 1200, sharePrice: 60, totalShares: 60, sharesSold: 22, bids: 8, endTime: "6h 45m", imageGradient: "from-violet-600 to-purple-700", hot: false },
  { id: 5, name: "Social Scheduler Pro", category: "Marketing", currentBid: 3200, sharePrice: 160, totalShares: 45, sharesSold: 35, bids: 15, endTime: "12h 10m", imageGradient: "from-amber-600 to-orange-700", hot: true },
  { id: 6, name: "HR Management Suite", category: "Productivity", currentBid: 4500, sharePrice: 225, totalShares: 40, sharesSold: 18, bids: 10, endTime: "3d 8h", imageGradient: "from-indigo-600 to-blue-700", hot: false },
];

export default function LiveAuctions() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Live Auctions</h1>
        <p className="text-sm text-muted-foreground mt-1">Bid on premium SaaS shares before auctions close.</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {auctions.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden hover:border-amber-500/30 transition-all">
              <div className={`h-28 bg-gradient-to-br ${a.imageGradient} relative flex items-center justify-center`}>
                <div className="absolute inset-0 bg-black/20" />
                <h3 className="relative text-white font-display font-bold text-lg px-4 text-center">{a.name}</h3>
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <Badge className="bg-amber-500/90 text-white text-[10px] border-0"><Gavel className="w-3 h-3 mr-1" /> Live</Badge>
                  {a.hot && <Badge className="bg-red-500/90 text-white text-[10px] border-0">Hot</Badge>}
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-secondary/40 rounded-lg p-2">
                    <p className="text-muted-foreground text-[10px]">Current Bid</p>
                    <p className="font-display font-bold text-sm">${a.currentBid.toLocaleString()}</p>
                  </div>
                  <div className="bg-secondary/40 rounded-lg p-2">
                    <p className="text-muted-foreground text-[10px]">Per Share</p>
                    <p className="font-display font-bold text-sm text-cyan-400">${a.sharePrice}</p>
                  </div>
                  <div className="bg-secondary/40 rounded-lg p-2">
                    <p className="text-muted-foreground text-[10px]">Bids</p>
                    <p className="font-display font-bold text-sm">{a.bids}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Shares Sold</span>
                    <span>{a.sharesSold}/{a.totalShares}</span>
                  </div>
                  <Progress value={(a.sharesSold / a.totalShares) * 100} className="h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-500" />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-medium">{a.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-3 h-3" /> {a.bids} bidders
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl h-9 text-sm font-semibold">
                  <Gavel className="w-4 h-4 mr-2" /> Place Bid
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}