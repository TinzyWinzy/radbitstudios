"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, File, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  projectId: string;
  onUploadComplete?: (url: string, filename: string) => void;
}

export function DocumentUpload({ projectId, onUploadComplete }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<Array<{ url: string; name: string }>>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (uploading) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setUploaded((prev) => [...prev, { url: json.url, name: file.name }]);
        onUploadComplete?.(json.url, json.filename);
      }
    } catch (e) {
      console.error("[DocumentUpload] Failed:", e);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          Documents
        </CardTitle>
        <CardDescription>Upload files related to this project.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className={`relative flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/30"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">Drop a file here or click to upload</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>

        {uploaded.length > 0 && (
          <div className="space-y-2">
            {uploaded.map((doc) => (
              <div key={doc.url} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <File className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm flex-1 truncate">{doc.name}</span>
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
