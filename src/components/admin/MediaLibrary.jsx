import React, { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Upload, Image, File, Trash2, Copy, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function MediaLibrary() {
  const queryClient = useQueryClient();
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { data: currentUser } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const { data: media = [], isLoading } = useQuery({
    queryKey: ["mediaLibrary"],
    queryFn: () => base44.entities.MediaLibrary.filter({}),
  });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/functions/uploadMedia", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");
      
      queryClient.invalidateQueries({ queryKey: ["mediaLibrary"] });
      toast.success("File uploaded successfully");
    } catch (err) {
      toast.error(err.message || "Failed to upload file");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.MediaLibrary.delete(id);
      queryClient.invalidateQueries({ queryKey: ["mediaLibrary"] });
      toast.success("Media deleted");
      setSelectedMedia(null);
    } catch (err) {
      toast.error("Failed to delete media");
    }
  };

  const getFileIcon = (type) => {
    if (type === "image") return <Image className="w-12 h-12 text-muted-foreground" />;
    return <File className="w-12 h-12 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage images and files for your marketplace.</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl gap-2"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Uploading..." : "Upload Image"}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading media...</div>
      ) : media.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
            <Image className="w-10 h-10 text-violet-400" />
          </div>
          <h2 className="text-xl font-display font-semibold">No Media Yet</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6">Upload images to use in your marketplace.</p>
          <Button onClick={() => fileInputRef.current?.click()} className="bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl">
            <Upload className="w-4 h-4 mr-2" /> Upload First Image
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group aspect-square rounded-xl overflow-hidden bg-secondary/30 border border-border/30 cursor-pointer hover:border-violet-500/50 transition-all"
              onClick={() => setSelectedMedia(m)}
            >
              {m.fileType === "image" ? (
                <img src={m.fileUrl} alt={m.fileName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {getFileIcon(m.fileType)}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                <p className="text-xs text-white truncate">{m.fileName}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Badge className="text-[9px] bg-violet-500/20 text-violet-400 border-violet-500/30">{m.fileType}</Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Media Detail Modal */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-2xl bg-card/95 border-border/40 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Media Details</DialogTitle>
          </DialogHeader>
          {selectedMedia && (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden bg-secondary/30 aspect-video flex items-center justify-center">
                {selectedMedia.fileType === "image" ? (
                  <img src={selectedMedia.fileUrl} alt={selectedMedia.fileName} className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="text-muted-foreground">{getFileIcon(selectedMedia.fileType)}</div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File Name:</span>
                  <span className="font-medium">{selectedMedia.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">{selectedMedia.fileType}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source:</span>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">{selectedMedia.source}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded:</span>
                  <span>{new Date(selectedMedia.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedMedia.fileUrl);
                    toast.success("URL copied to clipboard");
                  }}
                  className="flex-1 border-border/40 rounded-xl"
                >
                  <Copy className="w-4 h-4 mr-2" /> Copy URL
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedMedia.id)}
                  className="gap-2 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}