import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

// FAQ editor for a store's Page Settings — manage the question/answer pairs
// shown in the FAQ section below the footer.
export default function FaqSectionEditor({ form, setForm }) {
  const faqs = form.faqs || [];

  const updateFaq = (i, key, val) =>
    setForm((f) => {
      const next = [...(f.faqs || [])];
      next[i] = { ...next[i], [key]: val };
      return { ...f, faqs: next };
    });

  const addFaq = () => setForm((f) => ({ ...f, faqs: [...(f.faqs || []), { question: "", answer: "" }] }));

  const removeFaq = (i) =>
    setForm((f) => ({ ...f, faqs: (f.faqs || []).filter((_, idx) => idx !== i) }));

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground">Section Title</label>
        <Input
          value={form.faqTitle || ""}
          onChange={(e) => setForm((f) => ({ ...f, faqTitle: e.target.value }))}
          className="bg-secondary/50 border-border/30 rounded-xl mt-1"
          placeholder="Frequently Asked Questions"
        />
      </div>

      <div className="space-y-3">
        {faqs.length === 0 && (
          <p className="text-xs text-muted-foreground">No FAQs yet. Add your first question below.</p>
        )}
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl border border-border/30 bg-secondary/20 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Question {i + 1}</span>
              <button onClick={() => removeFaq(i)} className="text-muted-foreground hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <Input
              value={faq.question || ""}
              onChange={(e) => updateFaq(i, "question", e.target.value)}
              className="bg-secondary/50 border-border/30 rounded-xl"
              placeholder="What is your refund policy?"
            />
            <Textarea
              value={faq.answer || ""}
              onChange={(e) => updateFaq(i, "answer", e.target.value)}
              className="bg-secondary/50 border-border/30 rounded-xl h-20 resize-none"
              placeholder="Write a helpful answer..."
            />
          </div>
        ))}
      </div>

      <Button onClick={addFaq} variant="outline" size="sm" className="border-border/40 rounded-lg gap-1.5 text-xs">
        <Plus className="w-3.5 h-3.5" /> Add FAQ
      </Button>
    </div>
  );
}