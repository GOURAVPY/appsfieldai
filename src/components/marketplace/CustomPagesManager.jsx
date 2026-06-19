import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Trash2, Save, X, Pencil } from "lucide-react";
import { toast } from "sonner";

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const PRESETS = ["Privacy Policy", "Terms of Service", "Refund Policy", "About Us", "Contact"];

const blankForm = { title: "", slug: "", content: "", showInFooter: true, isPublished: true, sortOrder: 0 };

export default function CustomPagesManager({ marketplaceId }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null); // page object or "new"
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["customPages", marketplaceId],
    queryFn: () => base44.entities.CustomPage.filter({ marketplaceId }, "sortOrder"),
    enabled: !!marketplaceId,
  });

  const openNew = (preset) => {
    setForm({ ...blankForm, title: preset || "", slug: preset ? slugify(preset) : "", sortOrder: pages.length });
    setEditing("new");
  };

  const openEdit = (p) => {
    setForm({
      title: p.title || "",
      slug: p.slug || "",
      content: p.content || "",
      showInFooter: p.showInFooter ?? true,
      isPublished: p.isPublished ?? true,
      sortOrder: p.sortOrder ?? 0,
    });
    setEditing(p);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Page title is required");
    setSaving(true);
    const payload = { ...form, slug: form.slug.trim() || slugify(form.title), marketplaceId };
    if (editing === "new") {
      await base44.entities.CustomPage.create(payload);
      toast.success("Page created!");
    } else {
      await base44.entities.CustomPage.update(editing.id, payload);
      toast.success("Page updated!");
    }
    queryClient.invalidateQueries({ queryKey: ["customPages", marketplaceId] });
    setEditing(null);
    setForm(blankForm);
    setSaving(false);
  };

  const handleDelete = async (p) => {
    await base44.entities.CustomPage.delete(p.id);
    queryClient.invalidateQueries({ queryKey: ["customPages", marketplaceId] });
    toast.success("Page deleted");
  };

  if (editing) {
    return (
      <div className="bg-card/60 border border-border/40 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-display font-semibold">{editing === "new" ? "New Page" : "Edit Page"}</h3>
          <button onClick={() => { setEditing(null); setForm(blankForm); }} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Title</label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: editing === "new" && (!f.slug || f.slug === slugify(f.title)) ? slugify(e.target.value) : f.slug }))} className="bg-secondary/50 border-border/30 rounded-xl mt-1" placeholder="Privacy Policy" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Slug</label>
            <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))} className="bg-secondary/50 border-border/30 rounded-xl mt-1" placeholder="privacy-policy" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Content</label>
          <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="bg-secondary/50 border-border/30 rounded-xl mt-1 h-64 resize-none font-mono text-xs" placeholder="Write your page content here. Markdown is supported." />
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.showInFooter} onChange={e => setForm(f => ({ ...f, showInFooter: e.target.checked }))} className="accent-orange-500 w-4 h-4" />
            Show link in footer
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="accent-orange-500 w-4 h-4" />
            Published
          </label>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl gap-1.5 text-white border-0">
          <Save className="w-4 h-4" /> Save Page
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">Create custom store pages like Privacy Policy, Terms, etc.</p>
        <Button onClick={() => openNew()} className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl gap-1.5 text-white border-0">
          <Plus className="w-4 h-4" /> Add Page
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" /></div>
      ) : pages.length === 0 ? (
        <div className="text-center py-10 rounded-xl border border-dashed border-border/40">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm text-muted-foreground mb-3">No custom pages yet.</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {PRESETS.map(p => (
              <button key={p} onClick={() => openNew(p)} className="px-2.5 py-1 rounded-full bg-secondary/50 text-muted-foreground text-xs hover:bg-orange-500/10 hover:text-orange-400 transition-colors">+ {p}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map(p => (
            <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card/60">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground truncate">/{p.slug} · {p.isPublished ? "Published" : "Draft"}{p.showInFooter ? " · In footer" : ""}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="h-8 w-8 text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(p)} className="h-8 w-8 text-muted-foreground hover:text-red-400"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}