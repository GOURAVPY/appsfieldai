import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MessageCircle, Send, CheckCircle2, HelpCircle, User, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function QnAManager() {
  const queryClient = useQueryClient();
  const [answering, setAnswering] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("unanswered");

  const { data: allQnA = [], isLoading } = useQuery({
    queryKey: ["adminQnA"],
    queryFn: () => base44.entities.QnA.list("-created_date", 200),
  });

  const unanswered = allQnA.filter((q) => !q.isAnswered);
  const answered = allQnA.filter((q) => q.isAnswered);
  const displayed = filter === "unanswered" ? unanswered : filter === "answered" ? answered : allQnA;

  const handleAnswer = async () => {
    if (!answerText.trim() || !answering) return;
    setSubmitting(true);
    await base44.entities.QnA.update(answering.id, {
      answer: answerText.trim(),
      isAnswered: true,
      answeredByName: "Admin",
    });
    queryClient.invalidateQueries({ queryKey: ["adminQnA"] });
    setAnswering(null);
    setAnswerText("");
    setSubmitting(false);
    toast.success("Answer posted!");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-violet-400" />
            Q&A Manager
            <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-[10px]">
              {unanswered.length} pending
            </Badge>
          </CardTitle>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={filter === "unanswered" ? "default" : "ghost"}
              onClick={() => setFilter("unanswered")}
              className={`h-7 text-[11px] ${filter === "unanswered" ? "bg-violet-500/20 text-violet-400" : "text-muted-foreground"}`}
            >
              Pending ({unanswered.length})
            </Button>
            <Button
              size="sm"
              variant={filter === "answered" ? "default" : "ghost"}
              onClick={() => setFilter("answered")}
              className={`h-7 text-[11px] ${filter === "answered" ? "bg-violet-500/20 text-violet-400" : "text-muted-foreground"}`}
            >
              Answered ({answered.length})
            </Button>
            <Button
              size="sm"
              variant={filter === "all" ? "default" : "ghost"}
              onClick={() => setFilter("all")}
              className={`h-7 text-[11px] ${filter === "all" ? "bg-violet-500/20 text-violet-400" : "text-muted-foreground"}`}
            >
              All ({allQnA.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-border/30">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No questions found.
            </div>
          ) : (
            displayed.map((q) => (
              <div key={q.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{q.askedByName || "Anonymous"}</p>
                      <span className="text-xs text-violet-400">{q.listingTitle}</span>
                      {q.isAnswered ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Answered</Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">Pending</Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {new Date(q.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{q.question}</p>
                    {q.isAnswered && q.answer && (
                      <div className="mt-2 pl-3 border-l-2 border-emerald-500/30">
                        <p className="text-xs font-medium text-emerald-400">{q.answeredByName || "Seller"}</p>
                        <p className="text-sm mt-0.5 text-muted-foreground">{q.answer}</p>
                      </div>
                    )}
                  </div>
                  {!q.isAnswered && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setAnswering(q); setAnswerText(""); }}
                      className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 h-7 text-[11px] shrink-0"
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1" /> Answer
                    </Button>
                  )}
                </div>

                {answering?.id === q.id && (
                  <div className="pl-11 space-y-2">
                    <Textarea
                      placeholder="Write your answer..."
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      className="min-h-[60px] text-sm resize-none bg-secondary/30 border-border/30 rounded-xl"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setAnswering(null); setAnswerText(""); }}
                        className="h-7 text-[11px]"
                      >
                        <X className="w-3 h-3 mr-1" /> Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAnswer}
                        disabled={!answerText.trim() || submitting}
                        className="h-7 text-[11px] bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl"
                      >
                        <Send className="w-3 h-3 mr-1" /> Post Answer
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}