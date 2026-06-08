import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, ShoppingCart, Eye, TrendingUp, Zap } from "lucide-react";

const gradients = [
  "from-emerald-600 to-teal-700",
  "from-violet-600 to-purple-700",
  "from-orange-500 to-rose-600",
  "from-blue-600 to-cyan-600",
];

const images = [
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
];

function CountdownTimer({ deadline }) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const calc = () => {
      const now = Date.now();
      const end = new Date(deadline).getTime();
      setTime(Math.max(0, end - now));
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const h = Math.floor(time / 3600000);
  const m = Math.floor((time % 3600000) / 60000);
  const s = Math.floor((time % 60000) / 1000);

  if (time <= 0) {
    return <span className="text-xs font-medium text-red-400">Ended</span>;
  }

  return (
    <div className="flex items-center gap-1 text-xs font-mono text-cyan-400">
      <Clock className="w-3 h-3" />
      {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </div>
  );
}

export default function AuctionCard({ listing, index, onViewDetails, onLockSlot, onBuyFull }) {
  const gradient = gradients[index % gradients.length];
  const image = images[index % images.length];
  const slotPercent = Math.round((listing.soldSlots / listing.totalSlots) * 100);
  const slotsLeft = listing.totalSlots - listing.soldSlots;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      viewport={{ once: true }}
    >
      <Card className="group border-cyan-500/10 bg-card/60 backdrop-blur-xl hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 overflow-hidden rounded-2xl">
        {/* Image Area */}
        <div className={`relative h-44 bg-gradient-to-br ${gradient} overflow-hidden`}>
          <img src={image} alt={listing.name} className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-black/40 backdrop-blur-md text-white border-0 text-[10px] font-medium px-2 py-0.5">
              {listing.category}
            </Badge>
            <Badge className="bg-red-500/80 backdrop-blur-md text-white border-0 text-[10px] font-bold px-2 py-0.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white mr-1" />
              LIVE
            </Badge>
          </div>

          {/* Timer */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/50 backdrop-blur-md rounded-lg px-3 py-1.5">
              <CountdownTimer deadline={listing.endsAt} />
            </div>
          </div>
        </div>

        <CardContent className="p-4 space-y-4">
          {/* Name */}
          <div>
            <h3 className="text-base font-display font-bold group-hover:text-cyan-400 transition-colors">{listing.name}</h3>
          </div>

          {/* Slots */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" /> {listing.soldSlots} / {listing.totalSlots} slots
              </span>
              <span className="text-cyan-400 font-medium">{slotsLeft} left</span>
            </div>
            <Progress value={slotPercent} className="h-1.5 bg-secondary [&>div]:bg-gradient-to-r [&>div]:from-cyan-400 [&>div]:to-cyan-500" />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-secondary/40 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Owner Price</p>
              <p className="text-sm font-display font-bold text-foreground">${listing.fullPrice.toLocaleString()}</p>
            </div>
            <div className="bg-cyan-500/10 rounded-xl p-2.5 text-center border border-cyan-500/20">
              <p className="text-[10px] text-cyan-400/70 uppercase tracking-wider">Shared Price</p>
              <p className="text-sm font-display font-bold text-cyan-400">${listing.sharePrice}</p>
            </div>
          </div>

          {/* Revenue */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">${listing.monthlyRevenue.toLocaleString()}/mo</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              onClick={() => onLockSlot?.(listing)}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white rounded-xl text-xs h-9 font-semibold shadow-lg shadow-cyan-500/20"
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Lock Slot
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBuyFull?.(listing)}
              className="flex-1 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 rounded-xl text-xs h-9"
            >
              <Zap className="w-3.5 h-3.5 mr-1" /> Buy Full
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onViewDetails?.(listing)}
              className="text-muted-foreground hover:text-foreground rounded-xl text-xs h-9 px-2"
            >
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}