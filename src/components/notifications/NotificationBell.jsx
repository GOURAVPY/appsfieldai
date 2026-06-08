import React, { useState, useEffect, useRef } from "react";
import { Bell, Gavel, DollarSign, Building2, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const typeIcons = {
  outbid: Gavel,
  dividend: DollarSign,
  share_purchased: Users,
  ownership_sold: Building2,
};

const typeColors = {
  outbid: "text-amber-400 bg-amber-500/10",
  dividend: "text-emerald-400 bg-emerald-500/10",
  share_purchased: "text-violet-400 bg-violet-500/10",
  ownership_sold: "text-cyan-400 bg-cyan-500/10",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["myNotifications"],
    queryFn: async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) return [];
        const user = await base44.auth.me();
        return base44.entities.Notification.filter(
          { userId: user.id },
          ["-created_date"],
          20
        );
      } catch {
        return [];
      }
    },
    refetchInterval: 15000,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const n of unread) {
      await base44.entities.Notification.update(n.id, { read: true });
    }
    queryClient.invalidateQueries({ queryKey: ["myNotifications"] });
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-secondary/50 transition-colors"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl bg-card border border-border/40 shadow-2xl shadow-black/50 z-50">
          <div className="flex items-center justify-between p-3 border-b border-border/30">
            <span className="text-sm font-display font-bold">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[11px] text-orange-400 hover:text-orange-300 transition-colors">
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <Bell className="w-6 h-6 mx-auto mb-2 opacity-30" />
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = typeIcons[n.type] || Bell;
              return (
                <Link
                  key={n.id}
                  to={n.listingId ? `/saas/${n.listingId}` : "#"}
                  onClick={() => {
                    setOpen(false);
                    base44.entities.Notification.update(n.id, { read: true });
                  }}
                  className={`flex items-start gap-3 p-3 hover:bg-secondary/30 transition-colors border-b border-border/20 last:border-0 ${!n.read ? "bg-orange-500/5" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${typeColors[n.type] || "bg-secondary/50 text-muted-foreground"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(n.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}