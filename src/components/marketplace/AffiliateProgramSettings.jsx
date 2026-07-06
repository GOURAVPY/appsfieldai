import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Save, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Editor for the marketplace-wide affiliate program configuration (Marketplace.affiliateSettings).
export default function AffiliateProgramSettings({ marketplace }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const s = marketplace?.affiliateSettings || {};
  const [form, setForm] = useState({
    enabled: s.enabled ?? false,
    defaultCommissionRate: s.defaultCommissionRate ?? 30,
    minCommissionRate: s.minCommissionRate ?? 10,
    maxCommissionRate: s.maxCommissionRate ?? 50,
    holdDays: s.holdDays ?? 14,
    questions: s.questions || [],
    terms: s.terms || "",
  });

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const setQuestion = (i, val) => {
    const questions = [...form.questions];
    questions[i] = val;
    update({ questions });
  };
  const addQuestion = () => update({ questions: [...form.questions, ""] });
  const removeQuestion = (i) => update({ questions: form.questions.filter((_, idx) => idx !== i) });

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Marketplace.update(marketplace.id, {
      affiliateSettings: {
        ...form,
        defaultCommissionRate: Number(form.defaultCommissionRate) || 0,
        minCommissionRate: Number(form.minCommissionRate) || 0,
        maxCommissionRate: Number(form.maxCommissionRate) || 0,
        holdDays: Number(form.holdDays) || 0,
        questions: form.questions.filter((q) => q.trim()),
      },
    });
    queryClient.invalidateQueries({ queryKey: ["ownerMarketplaces"] });
    toast.success("Affiliate program settings saved!");
    setSaving(false);
  };

  return (
    <div className="bg-card/60 border border-border/40 rounded-2xl p-6 space-y-6">
      <label className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors">
        <input type="checkbox" checked={form.enabled} onChange={(e) => update({ enabled: e.target.checked })} className="accent-orange-500 w-4 h-4" />
        <div>
          <p className="text-sm font-medium">Enable Affiliate Program</p>
          <p className="text-[11px] text-muted-foreground">Let customers apply to promote your products and earn commission.</p>
        </div>
      </label>

      {form.enabled && (
        <>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Commission</p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-muted-foreground">Default Rate (%)</label><Input type="number" value={form.defaultCommissionRate} onChange={(e) => update({ defaultCommissionRate: e.target.value })} className="bg-secondary/50 border-border/30 rounded-xl mt-1" /></div>
              <div><label className="text-xs text-muted-foreground">Hold Days (refund window)</label><Input type="number" value={form.holdDays} onChange={(e) => update({ holdDays: e.target.value })} className="bg-secondary/50 border-border/30 rounded-xl mt-1" /></div>
              <div><label className="text-xs text-muted-foreground">Min Rate (%)</label><Input type="number" value={form.minCommissionRate} onChange={(e) => update({ minCommissionRate: e.target.value })} className="bg-secondary/50 border-border/30 rounded-xl mt-1" /></div>
              <div><label className="text-xs text-muted-foreground">Max Rate (%)</label><Input type="number" value={form.maxCommissionRate} onChange={(e) => update({ maxCommissionRate: e.target.value })} className="bg-secondary/50 border-border/30 rounded-xl mt-1" /></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Application Questions</p>
              <Button onClick={addQuestion} variant="outline" size="sm" className="border-border/40 rounded-lg gap-1.5 text-xs h-7"><Plus className="w-3.5 h-3.5" /> Add</Button>
            </div>
            <div className="space-y-2">
              {form.questions.length === 0 && <p className="text-[11px] text-muted-foreground">No questions — affiliates apply without answering anything.</p>}
              {form.questions.map((q, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={q} onChange={(e) => setQuestion(i, e.target.value)} className="bg-secondary/50 border-border/30 rounded-xl" placeholder="e.g. How will you promote this product?" />
                  <Button onClick={() => removeQuestion(i)} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-red-400 shrink-0"><X className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Program Terms</p>
            <Textarea value={form.terms} onChange={(e) => update({ terms: e.target.value })} className="bg-secondary/50 border-border/30 rounded-xl h-28 resize-none" placeholder="Terms shown to affiliates when they apply (payout schedule, allowed channels, minimum payout...)." />
          </div>
        </>
      )}

      <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl gap-1.5 text-white border-0">
        <Save className="w-4 h-4" /> Save Affiliate Settings
      </Button>
    </div>
  );
}