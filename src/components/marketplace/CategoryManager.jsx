import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tags, Plus, Trash2, Loader2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function CategoryManager({ marketplaceId }) {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["softwareCategories", marketplaceId],
    queryFn: () => base44.entities.SoftwareCategory.filter({ marketplaceId }),
    enabled: !!marketplaceId,
  });

  const handleAdd = async () => {
    if (!newName.trim()) return toast.error("Category name required.");
    setAdding(true);
    const slug = newSlug.trim() || newName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await base44.entities.SoftwareCategory.create({ marketplaceId, name: newName.trim(), slug, sortOrder: categories.length });
    queryClient.invalidateQueries({ queryKey: ["softwareCategories", marketplaceId] });
    setNewName("");
    setNewSlug("");
    setAdding(false);
    toast.success("Category added.");
  };

  const handleDelete = async (cat) => {
    setDeleting(cat.id);
    await base44.entities.SoftwareCategory.delete(cat.id);
    queryClient.invalidateQueries({ queryKey: ["softwareCategories", marketplaceId] });
    setDeleting(null);
    toast.success("Category deleted.");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-display font-semibold flex items-center gap-2">
        <Tags className="w-5 h-5 text-teal-400" /> Categories
      </h3>

      <div className="flex gap-2">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Category name" className="h-8 text-xs flex-1" />
        <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="slug (auto)" className="h-8 text-xs w-32" />
        <Button size="sm" onClick={handleAdd} disabled={adding} className="bg-teal-600 hover:bg-teal-700 h-8 text-xs">
          {adding ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Plus className="w-3 h-3 mr-1" />}Add
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4 text-muted-foreground text-sm"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
      ) : categories.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-sm">No categories yet. Add your first one!</div>
      ) : (
        <div className="space-y-1.5">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between bg-card/40 border border-border/40 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <GripVertical className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs">{c.name}</span>
                <span className="text-[10px] text-muted-foreground">/{c.slug}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(c)} disabled={deleting === c.id} className="h-7 w-7 p-0 text-red-400"><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}