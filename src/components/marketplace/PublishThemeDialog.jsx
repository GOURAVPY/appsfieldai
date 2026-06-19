import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Palette, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function PublishThemeDialog({ open, onClose, marketplace, pageSections }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePublish = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Give your theme a name first.");
      return;
    }
    setSaving(true);
    try {
      const slug = slugify(trimmed) || `theme-${Date.now()}`;
      const existing = await base44.entities.StoreTheme.filter({ slug });
      const payload = {
        name: trimmed,
        slug,
        sourceMarketplaceId: marketplace?.id,
        pageSections,
        isActive: true,
      };
      if (existing?.[0]) {
        await base44.entities.StoreTheme.update(existing[0].id, payload);
      } else {
        await base44.entities.StoreTheme.create(payload);
      }
      toast.success(`Theme "${trimmed}" published — available as a store template.`);
      setName("");
      onClose();
    } catch {
      toast.error("Couldn't publish the theme. Try again.");
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#1a1a1a] border-border/40">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Palette className="w-4 h-4 text-violet-400" /> Publish to Theme
          </DialogTitle>
          <DialogDescription>
            Save this page's current sections as a reusable store theme template.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <label className="text-xs text-muted-foreground">Theme Name</label>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePublish()}
            className="bg-[#252525] border-border/30 rounded-xl mt-1"
            placeholder="e.g. Bold Orange, Minimal Light…"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handlePublish} disabled={saving} className="bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
            Publish Theme
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}