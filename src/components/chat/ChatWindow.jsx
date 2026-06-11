import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Send, Paperclip, Image, FileText, Search, X, CheckCheck, Check, ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ChatWindow({ conversation, currentUser, onBack }) {
  const [newMsg, setNewMsg] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchIndex, setSearchIndex] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const isBuyer = currentUser?.id === conversation?.buyerId;
  const otherUserId = isBuyer ? conversation?.sellerId : conversation?.buyerId;

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", conversation?.id],
    queryFn: async () => {
      if (!currentUser?.id || !conversation?.id) return [];
      const [sent, received] = await Promise.all([
        base44.entities.Message.filter({ senderId: currentUser.id, listingId: conversation.listingId }, "created_date", 200),
        base44.entities.Message.filter({ receiverId: currentUser.id, listingId: conversation.listingId }, "created_date", 200),
      ]);
      const all = [...sent, ...received]
        .filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i)
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      return all;
    },
    enabled: !!currentUser?.id && !!conversation?.id,
  });

  // Subscribe to new messages
  useEffect(() => {
    if (!currentUser?.id || !conversation?.listingId) return;
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.type === "create") {
        const msg = event.data;
        if (msg.listingId === conversation.listingId &&
            (msg.senderId === currentUser.id || msg.receiverId === currentUser.id)) {
          queryClient.invalidateQueries({ queryKey: ["messages", conversation.id] });
          // Mark as read if received
          if (msg.receiverId === currentUser.id && !msg.read) {
            base44.entities.Message.update(msg.id, { read: true });
          }
        }
      }
    });
    return unsub;
  }, [currentUser?.id, conversation?.listingId, conversation?.id]);

  // Mark unread messages as read when opening
  useEffect(() => {
    if (!messages.length || !currentUser?.id) return;
    const unreadFromOther = messages.filter(
      (m) => m.senderId !== currentUser.id && !m.read
    );
    unreadFromOther.forEach((m) => {
      base44.entities.Message.update(m.id, { read: true });
    });
  }, [messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const content = newMsg.trim();
    if (!content || !currentUser?.id || !otherUserId || !conversation?.listingId) return;
    setNewMsg("");

    await base44.entities.Message.create({
      senderId: currentUser.id,
      receiverId: otherUserId,
      listingId: conversation.listingId,
      content,
      read: false,
    });

    // Update conversation last message
    await base44.entities.Conversation.update(conversation.id, {
      lastMessage: content,
      lastMessageAt: new Date().toISOString(),
      lastMessageSenderId: currentUser.id,
      [isBuyer ? "sellerUnread" : "buyerUnread"]: (conversation[isBuyer ? "sellerUnread" : "buyerUnread"] || 0) + 1,
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    if (!isImage && !isPdf) {
      toast.error("Only images and PDFs are supported");
      return;
    }

    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Message.create({
      senderId: currentUser.id,
      receiverId: otherUserId,
      listingId: conversation.listingId,
      content: file.name,
      attachmentUrl: file_url,
      attachmentType: isImage ? "image" : "pdf",
      attachmentName: file.name,
      read: false,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Search results
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return messages
      .map((m, i) => ({ ...m, originalIndex: i }))
      .filter((m) => m.content?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [messages, searchTerm]);

  const highlightSearch = (text) => {
    if (!searchTerm.trim()) return text;
    const parts = text.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase()
        ? <mark key={i} className="bg-yellow-400/30 text-yellow-200 rounded px-0.5">{part}</mark>
        : part
    );
  };

  // Group by date
  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastDate = null;
    messages.forEach((msg) => {
      const d = new Date(msg.created_date).toLocaleDateString();
      if (d !== lastDate) {
        groups.push({ type: "date", date: d });
        lastDate = d;
      }
      groups.push({ type: "message", ...msg });
    });
    return groups;
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/40 bg-secondary/20">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden rounded-lg w-7 h-7">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <p className="text-xs font-medium">{conversation?.listingTitle || "Chat"}</p>
            <p className="text-[10px] text-muted-foreground">
              {isBuyer ? "You are the buyer" : "You are the seller"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSearch(!showSearch)}
          className="rounded-lg w-7 h-7"
        >
          <Search className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border/40"
          >
            <div className="flex items-center gap-2 p-2">
              <Input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setSearchIndex(0); }}
                placeholder="Search messages..."
                className="h-7 text-xs rounded-lg"
                autoFocus
              />
              {searchResults.length > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                  <Button variant="ghost" size="icon" className="w-6 h-6"
                    onClick={() => setSearchIndex((searchIndex - 1 + searchResults.length) % searchResults.length)}>
                    <ChevronDown className="w-3 h-3 rotate-90" />
                  </Button>
                  <span>{searchIndex + 1}/{searchResults.length}</span>
                  <Button variant="ghost" size="icon" className="w-6 h-6"
                    onClick={() => setSearchIndex((searchIndex + 1) % searchResults.length)}>
                    <ChevronDown className="w-3 h-3 -rotate-90" />
                  </Button>
                </div>
              )}
              <Button variant="ghost" size="icon" onClick={() => setShowSearch(false)} className="w-6 h-6">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-5 h-5 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : groupedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
            No messages yet. Say hello!
          </div>
        ) : (
          groupedMessages.map((item, idx) => {
            if (item.type === "date") {
              return (
                <div key={`date-${item.date}`} className="flex justify-center py-2">
                  <Badge variant="secondary" className="text-[9px] px-2 py-0.5 bg-secondary/40">
                    {item.date}
                  </Badge>
                </div>
              );
            }
            const isMine = item.senderId === currentUser?.id;
            const isSearched = searchTerm.trim() && item.content?.toLowerCase().includes(searchTerm.toLowerCase());
            return (
              <div key={item.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                  isMine
                    ? "bg-violet-500 text-white rounded-br-md"
                    : "bg-secondary rounded-bl-md"
                } ${isSearched ? "ring-1 ring-yellow-400/50" : ""}`}>
                  {item.attachmentUrl ? (
                    <a href={item.attachmentUrl} target="_blank" rel="noopener noreferrer" className="block">
                      {item.attachmentType === "image" ? (
                        <img src={item.attachmentUrl} alt={item.attachmentName} className="max-w-[200px] rounded-lg mb-1" />
                      ) : (
                        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1.5">
                          <FileText className="w-4 h-4" />
                          <span className="text-[10px] truncate max-w-[120px]">{item.attachmentName}</span>
                          <Download className="w-3 h-3" />
                        </div>
                      )}
                    </a>
                  ) : null}
                  <p className="whitespace-pre-wrap break-words">{highlightSearch(item.content)}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
                    <span className={`text-[9px] ${isMine ? "text-white/50" : "text-muted-foreground"}`}>
                      {new Date(item.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {isMine && (
                      item.read ? <CheckCheck className="w-3 h-3 text-cyan-300" /> : <Check className="w-3 h-3 text-white/30" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/40">
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg w-8 h-8 text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Textarea
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[38px] max-h-[120px] h-[38px] text-xs resize-none rounded-xl bg-secondary/40 border-border/40"
            rows={1}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMsg.trim()}
            size="icon"
            className="w-9 h-9 rounded-xl bg-violet-500 hover:bg-violet-600 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}