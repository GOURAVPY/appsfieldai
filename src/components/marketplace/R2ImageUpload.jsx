import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";

// Reusable upload field that pushes a file to Cloudflare R2 (via the uploadToR2
// backend function) and returns the public CDN URL. Also allows pasting a URL directly.
export default function R2ImageUpload({ value, onChange, campaignId = "store-asset", placeholder = "https://example.com/image.png", accept = "image/*" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await base44.functions.invoke("uploadToR2", {
        fileData,
        fileName: file.name,
        contentType: file.type,
        campaignId,
      });
      const url = res.data?.fileUrl;
      if (!url) throw new Error(res.data?.error || "Upload failed");
      onChange(url);
      toast.success("Uploaded");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          className="bg-secondary/50 border-border/30 rounded-xl"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 flex items-center gap-1.5 px-3 h-9 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-medium hover:bg-orange-500/30 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? "Uploading" : "Upload"}
        </button>
        <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
      </div>
      {value && (
        <div className="relative inline-block">
          <img src={value} alt="preview" className="h-16 rounded-lg border border-border/30 object-contain bg-secondary/30" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}