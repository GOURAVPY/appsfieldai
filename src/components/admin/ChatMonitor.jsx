import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MessageCircle, User, ChevronDown, ChevronUp, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ChatMonitor() {
  const [expandedConv, setExpandedConv] = useState(null);

  const { data: allMessages = [], isLoading } = useQuery({
    queryKey: ["adminMessages"],
    queryFn: () => base44.entities.Message.list("-created_date", 200),
  });

  const { data: allListings = [] } = useQuery({
    queryKey: ["adminChatListings"],
    queryFn: () => base44.entities.SaaSListing.list(),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["adminChatUsers"],
    queryFn: () => base44.entities.User.list(),
  });

  const listingMap = useMemo(() => {
    const map = {};
    allListings.forEach((l) => { map[l.id] = l.title; });
    return map;
  }, [allListings]);

  const userMap = useMemo(() => {
    const map = {};
    allUsers.forEach((u) => { map[u.id] = u.full_name || u.email; });
    return map;
  }, [allUsers]);

  const conversations = useMemo(() => {
    const groups = {};
    allMessages.forEach((msg) => {
      if (!groups[msg.listingId]) {
        groups[msg.listingId] = {
          listingId: msg.listingId,
          listingTitle: listingMap[msg.listingId] || "Unknown Listing",
          participants: new Set(),
          messages: [],
          lastActivity: msg.created_date,
        };
      }
      groups[msg.listingId].participants.add(msg.senderId);
      groups[msg.listingId].participants.add(msg.receiverId);
      groups[msg.listingId].messages.push(msg);
      if (new Date(msg.created_date) > new Date(groups[msg.listingId].lastActivity)) {
        groups[msg.listingId].lastActivity = msg.created_date;
      }
    });
    return Object.values(groups).sort(
      (a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)
    );
  }, [allMessages, listingMap]);

  const totalMessages = allMessages.length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-violet-400" />
            Chat Monitor
            <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-[10px]">
              {conversations.length} convos · {totalMessages} msgs
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No conversations yet.
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div key={conv.listingId} className="rounded-xl bg-secondary/20 border border-border/30 overflow-hidden">
                  <button
                    onClick={() => setExpandedConv(expandedConv === conv.listingId ? null : conv.listingId)}
                    className="w-full flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                        <Store className="w-4 h-4 text-violet-400" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-sm font-medium truncate">{conv.listingTitle}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {conv.participants.size} participants · {conv.messages.length} messages ·{" "}
                          {new Date(conv.lastActivity).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    {expandedConv === conv.listingId ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  {expandedConv === conv.listingId && (
                    <div className="border-t border-border/30 divide-y divide-border/20">
                      {conv.messages
                        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
                        .map((msg) => (
                          <div key={msg.id} className="p-3 space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                                <User className="w-3 h-3 text-muted-foreground" />
                              </div>
                              <span className="text-xs font-medium">
                                {userMap[msg.senderId] || "Unknown"}
                              </span>
                              <span className="text-[10px] text-muted-foreground">→</span>
                              <span className="text-xs text-muted-foreground">
                                {userMap[msg.receiverId] || "Unknown"}
                              </span>
                              <span className="text-[10px] text-muted-foreground ml-auto">
                                {new Date(msg.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground pl-7">{msg.content}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}