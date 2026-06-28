"use client";

import { useState, useEffect, useContext, useCallback } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listMedia, deleteMedia, uploadMedia, type MediaItem } from "@/services/media.service";
import { AuthContext } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Image as ImageIcon, FileText, File, Trash2, Copy, Upload, Loader2, Check,
} from "lucide-react";

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
  "application/pdf",
];

export default function MediaPage() {
  const { role } = useContext(AuthContext);
  const router = useRouter();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await listMedia("media/");
      setItems(all);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (role !== "admin" && role !== "super_admin") {
      router.push("/dashboard");
      return;
    }
    load();
  }, [role, router, load]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith("image/")) {
      alert("File type not supported. Please upload images or PDFs.");
      return;
    }
    setUploading(true);
    try {
      const item = await uploadMedia(file);
      setItems(prev => [item, ...prev]);
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setUploading(false);
  };

  const handleDelete = (item: MediaItem) => {
    setDeleteTarget(item);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMedia(deleteTarget.fullPath);
      setItems(prev => prev.filter(i => i.fullPath !== deleteTarget.fullPath));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleteTarget(null);
    }
  };

  const copyUrl = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedId(item.fullPath);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = item.url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedId(item.fullPath);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const isImage = (type: string) => type.startsWith("image/");

  if (role === null) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (role !== "admin" && role !== "super_admin") return null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-headline text-2xl font-bold">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Uploaded images and documents
          </p>
        </div>
        <div className="ml-auto relative">
          <Button disabled={uploading} className="relative">
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {uploading ? "Uploading..." : "Upload"}
            <input
              type="file"
              accept="image/*,.pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleUpload}
              disabled={uploading}
            />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ImageIcon aria-hidden="true" className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-1">No media yet</p>
          <p className="text-sm">Upload images and PDFs to use in your content</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.fullPath}
              className="group relative rounded-xl border border-border/50 bg-card overflow-hidden hover:border-primary/30 transition-colors"
            >
              <div className="aspect-square flex items-center justify-center bg-muted/30">
                {isImage(item.contentType) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    {item.contentType === "application/pdf" ? (
                      <FileText className="h-10 w-10" />
                    ) : (
                      <File className="h-10 w-10" />
                    )}
                    <span className="text-xs px-2 text-center truncate max-w-full">
                      {item.contentType.split("/").pop()}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3">
                <p className="text-xs truncate font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatSize(item.size)}
                </p>
              </div>

              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyUrl(item)}
                  title={copiedId === item.fullPath ? "Copied!" : "Copy URL"}
                >
                  {copiedId === item.fullPath ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(item)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete File"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={executeDelete}
      />
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
