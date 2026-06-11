import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";

export default function ChatsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeConvo, setActiveConvo] = useState(null);
  const [showList, setShowList] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) {
        base44.auth.redirectToLogin("/chats");
        return;
      }
      const me = await base44.auth.me();
      setCurrentUser(me);
    });
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;
    const beat = () => base44.functions.invoke("heartbeat", {}).catch(() => {});
    beat();
    const interval = setInterval(beat, 30000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const handleSelectConvo = (convo) => {
    setActiveConvo(convo);
    setShowList(false);
  };

  const handleBack = () => {
    setShowList(true);
    setActiveConvo(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-display font-bold mt-2">Messages</h1>
      </motion.div>

      <div className="flex rounded-2xl overflow-hidden border border-border/40 bg-card/60 backdrop-blur-xl h-[75vh]">
        {/* Conversation list sidebar */}
        <div className={`w-full md:w-80 border-r border-border/40 flex-shrink-0 ${!showList ? "hidden md:block" : "block"}`}>
          <ConversationList
            currentUser={currentUser}
            activeConvoId={activeConvo?.id}
            onSelect={handleSelectConvo}
          />
        </div>

        {/* Chat window */}
        <div className={`flex-1 ${showList ? "hidden md:flex" : "flex"}`}>
          {activeConvo ? (
            <ChatWindow
              conversation={activeConvo}
              currentUser={currentUser}
              onBack={handleBack}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}