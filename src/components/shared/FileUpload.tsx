"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, FileText, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Folder = "avatar" | "logo" | "media-kit" | "attachment" | "campaign-brief";

interface FileUploadProps {
  folder: Folder;
  accept: string; // e.g. "image/jpeg,image/png"
  maxSizeBytes: number;
  onUpload: (url: string) => void;
  currentUrl?: string | null;
  label?: string;
  /** If true, renders as a compact inline button rather than a dropzone card */
  compact?: boolean;
  className?: string;
}

function isImage(url: string) {
  return /\.(jpe?g|png|webp|gif|svg)(\?|$)/i.test(url);
}

export function FileUpload({
  folder,
  accept,
  maxSizeBytes,
  onUpload,
  currentUrl,
  label = "Upload file",
  compact = false,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);

  async function handleFile(file: File) {
    setError(null);

    if (file.size > maxSizeBytes) {
      setError(`File too large. Max size is ${Math.round(maxSizeBytes / 1024 / 1024)} MB.`);
      return;
    }

    if (!accept.split(",").includes(file.type)) {
      setError(`Invalid file type. Allowed: ${accept}`);
      return;
    }

    setUploading(true);
    try {
      // Get presigned URL
      const res = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, folder }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to get upload URL");
      }

      const { uploadUrl, publicUrl } = await res.json();

      // Upload directly to R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      setPreview(publicUrl);
      onUpload(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function clearFile() {
    setPreview(null);
    onUpload("");
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
        {preview ? (
          <div className="flex items-center gap-2">
            {isImage(preview) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Uploaded" className="w-8 h-8 rounded object-cover border border-gray-200" />
            ) : (
              <FileText className="w-5 h-5 text-gray-400" />
            )}
            <a href={preview} target="_blank" rel="noopener noreferrer" className="text-body-sm text-brand-600 hover:underline truncate max-w-[160px]">
              View file
            </a>
            <button type="button" onClick={clearFile} className="text-gray-400 hover:text-error-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 text-body-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Uploading…" : label}
          </button>
        )}
        {error && <p className="text-caption text-error-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />

      {preview && isImage(preview) ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Uploaded"
            className="w-24 h-24 rounded-xl object-cover border border-gray-200"
          />
          <button
            type="button"
            onClick={clearFile}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-error-600 shadow-sm"
          >
            <X className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 block text-caption text-brand-600 hover:text-brand-700"
          >
            Change
          </button>
        </div>
      ) : preview ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
          <FileText className="w-8 h-8 text-gray-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <a href={preview} target="_blank" rel="noopener noreferrer" className="text-body-sm text-brand-600 hover:underline truncate block">
              View uploaded file
            </a>
          </div>
          <button type="button" onClick={clearFile} className="text-gray-400 hover:text-error-600 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer transition-colors",
            uploading ? "opacity-50 cursor-not-allowed" : "hover:border-brand-400 hover:bg-brand-50/30",
          )}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
          ) : accept.startsWith("image") ? (
            <ImageIcon className="w-6 h-6 text-gray-400" />
          ) : (
            <Upload className="w-6 h-6 text-gray-400" />
          )}
          <div>
            <p className="text-body-sm text-gray-600">
              {uploading ? "Uploading…" : (
                <><span className="text-brand-600 font-medium">Click to upload</span> or drag and drop</>
              )}
            </p>
            <p className="text-caption text-gray-400 mt-0.5">
              {accept.replace(/,/g, ", ")} · max {Math.round(maxSizeBytes / 1024 / 1024)} MB
            </p>
          </div>
        </div>
      )}

      {error && <p className="text-caption text-error-600">{error}</p>}
    </div>
  );
}
