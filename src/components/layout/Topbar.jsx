import React from "react";
import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Topbar() {
  return (
    <header className="h-16 border-b border-border/40 bg-card/60 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search SaaS listings..."
          className="pl-9 h-9 bg-secondary/50 border-border/30 text-sm rounded-lg"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-secondary/50 transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500" />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-border/30">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">Alex Johnson</p>
            <p className="text-[11px] text-muted-foreground">Investor</p>
          </div>
          <Avatar className="w-9 h-9 border-2 border-violet-500/30">
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-cyan-500 text-white text-sm font-bold">AJ</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}