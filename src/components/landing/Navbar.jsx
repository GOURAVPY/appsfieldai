import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Settings, LogOut, User, Store, Package, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "Marketplace", href: "/", icon: Store },
    { label: "My Deals", href: "/investments", icon: Package },
    { label: "Admin", href: "/admin", icon: Shield },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-cyan-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-shadow">
              <span className="text-white font-display font-bold text-sm">SD</span>
            </div>
            <span className="text-xl font-display font-bold tracking-tight">
              Split<span className="text-cyan-400">Deal</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => {
              const active = location.pathname === l.href;
              return (
                <Link
                  key={l.label}
                  to={l.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active ? "text-cyan-400 bg-cyan-500/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <l.icon className="w-4 h-4" />
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg w-9 h-9">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg w-9 h-9">
              <LogOut className="w-4 h-4" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center ml-1">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-cyan-500/10 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-white/5"
                >
                  <l.icon className="w-4 h-4" />
                  {l.label}
                </Link>
              ))}
              <div className="flex items-center gap-2 pt-3 border-t border-cyan-500/10 mt-2">
                <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground justify-start"><Settings className="w-4 h-4 mr-2" />Settings</Button>
                <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground justify-start"><LogOut className="w-4 h-4 mr-2" />Logout</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}