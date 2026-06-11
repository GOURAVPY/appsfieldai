import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MessageCircle, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ConversationList({ currentUser, activeConvoId, onSelect }) {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const asBuyer = await base44.entities.Conversation.filter(
        { buyerId: currentUser.id },
        "-lastMessageAt",
        50
      );
      const asSeller = await base44.entities.Conversation.filter(
        { sellerId: currentUser.id },
        "-lastMessageAt",
        50
      );
      const all = [...asBuyer, ...asSeller].sort(
        (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
      );
      // Deduplicate
      const seen = new Set();
      return all.filter((c) => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });
    },
    enabled: !!currentUser?.id,
    refetchInterval: 5000,
  });

  // Subscribe to conversation updates
  React.useEffect(() => {
    if (!currentUser?.id) return;
    const unsub = base44.entities.Conversation.subscribe((event) => {
      if (event.type === "update" || event.type === "create") {
        queryClient.invalidateQueries({ queryKey: ["conversations", currentUser.id] });
      }
    });
    return unsub;
  }, [currentUser?.id]);

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (c) => c.listingTitle?.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  const getUnreadCount = (convo) => {
    if (!currentUser) return 0;
    if (currentUser.id === convo.buyerId) return convo.buyerUnread || 0;
    if (currentUser.id === convo.sellerId) return convo.sellerUnread || 0;
    return 0;
  };

  const getOtherUserName = (convo) => {
    if (!currentUser) return "User";
    return currentUser.id === convo.buyerId ? "Seller" : "Buyer";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border/40">
        <h2 className="text-sm font-display font-semibold flex items-center gap-2 mb-3">
          <MessageCircle className="w-4 h-4 text-violet-400" />
          Messages
        </h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="h-8 text-xs pl-8 rounded-lg bg-secondary/30 border-border/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-xs">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
            {search ? "No matching conversations" : "No conversations yet"}
          </div>
        ) : (
          filtered.map((convo) => {
            const unread = getUnreadCount(convo);
            const isActive = activeConvoId === convo.id;
            return (
              <motion.button
                key={convo.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => onSelect(convo)}
                className={`w-full text-left p-3 border-b border-border/20 hover:bg-secondary/30 transition-colors ${
                  isActive ? "bg-violet-500/10 border-l-2 border-l-violet-500" : ""
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium truncate">{convo.listingTitle}</p>
                      {convo.lastMessageAt && (
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                          {formatTime(convo.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {getOtherUserName(convo)}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {convo.lastMessage || "No messages"}
                    </p>
                  </div>
                  {unread > 0 && (
                    <Badge className="bg-violet-500 text-white text-[9px] h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 shrink-0">
                      {unread}
                    </Badge>
                  )}
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}