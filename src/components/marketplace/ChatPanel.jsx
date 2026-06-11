import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { MessageCircle, ArrowLeft, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ChatPanel({ listing, currentUser }) {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const ownerId = listing.ownerUserId;
  const isOwner = currentUser?.id === ownerId;
  const otherUserId = isOwner ? messages.find((m) => m.senderId !== currentUser?.id)?.senderId : ownerId;

  useEffect(() => {
    if (!expanded || !currentUser?.id || !listing.id) return;
    fetchMessages();
  }, [expanded, currentUser?.id, listing.id]);

  useEffect(() => {
    if (!expanded || !currentUser?.id || !listing.id) return;
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.type === "create") {
        const msg = event.data;
        if (msg.listingId === listing.id &&
            (msg.senderId === currentUser.id || msg.receiverId === currentUser.id)) {
          setMessages((prev) => {
            if (prev.find((m) => m.id === msg.id)) return prev;
            return [...prev, msg].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
          });
        }
      }
    });
    return unsub;
  }, [expanded, currentUser?.id, listing.id]);

  const fetchMessages = async () => {
    setLoading(true);
    const [sent, received] = await Promise.all([
      base44.entities.Message.filter({ senderId: currentUser.id, listingId: listing.id }, "created_date", 100),
      base44.entities.Message.filter({ receiverId: currentUser.id, listingId: listing.id }, "created_date", 100),
    ]);
    const all = [...sent, ...received]
      .filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i)
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    setMessages(all);
    setLoading(false);
  };

  const sendMessage = async () => {
    const msg = document.getElementById(`chat-input-${listing.id}`)?.value;
    if (!msg?.trim() || sending) return;
    if (!currentUser?.id) { toast.error("Please log in."); return; }
    if (!otherUserId) { toast.error("No recipient. Wait for a message first."); return; }

    setSending(true);
    await base44.entities.Message.create({
      senderId: currentUser.id,
      receiverId: otherUserId,
      listingId: listing.id,
      content: msg.trim(),
      read: false,
    });
    document.getElementById(`chat-input-${listing.id}`).value = "";
    setSending(false);
  };

  return (
    <Card className="border-violet-500/20 bg-card/60 backdrop-blur-xl">
      <CardHeader className="cursor-pointer select-none py-3" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="text-sm font-display flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-violet-400" />
            Chat with {isOwner ? "Buyer" : "Seller"}
          </span>
          {messages.length > 0 && (
            <span className="text-[10px] bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full">
              {messages.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      {expanded && (
        <CardContent className="pb-4 space-y-3">
          <div className="h-40 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-4 h-4 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-6">No messages yet.</p>
            ) : (
              messages.map((msg) => {
                const isMine = msg.senderId === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-xs ${
                      isMine ? "bg-violet-500 text-white rounded-br-md" : "bg-secondary rounded-bl-md"
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <div className={`flex items-center gap-1 mt-0.5 ${isMine ? "justify-end" : ""}`}>
                        <span className={`text-[9px] ${isMine ? "text-white/60" : "text-muted-foreground"}`}>
                          {new Date(msg.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {isMine && <CheckCheck className={`w-2.5 h-2.5 ${msg.read ? "text-cyan-300" : "text-white/40"}`} />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex gap-2">
            <Textarea
              id={`chat-input-${listing.id}`}
              placeholder="Type..."
              className="min-h-[36px] h-9 text-xs resize-none rounded-xl bg-secondary/40 border-border/40"
              rows={1}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            />
            <Button onClick={sendMessage} disabled={sending} size="icon" className="w-9 h-9 rounded-xl bg-violet-500 hover:bg-violet-600 flex-shrink-0">
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}