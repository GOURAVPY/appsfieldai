import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-500/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-cyan-400/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 mb-8">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-medium text-cyan-400 tracking-wide">Group Buying For Software</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.05] tracking-tight"
        >
          Split the Price.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-500">
            Own the Software.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
        >
          Join group deals on premium SaaS products. Lock your slot, split the cost, and save up to <span className="text-cyan-400 font-semibold">98%</span> compared to buying full ownership alone.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 mt-8 justify-center"
        >
          <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white rounded-xl px-8 font-semibold text-base group shadow-lg shadow-cyan-500/25">
            Browse Live Deals
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button size="lg" variant="outline" className="rounded-xl px-8 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 font-semibold text-base">
            Submit Your SaaS
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 text-xs text-muted-foreground flex items-center justify-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active SaaS deals live now
        </motion.p>
      </div>
    </section>
  );
}