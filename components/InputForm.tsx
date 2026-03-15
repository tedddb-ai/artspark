"use client";

import { useState, useRef, useEffect } from "react";

interface InputFormProps {
  onGenerate: (data: {
    file?: File;
    imageBase64?: string;
    mediaType?: string;
    sourceUrl?: string;
    notes?: string;
    caption?: string;
  }) => void;
  isLoading: boolean;
}

export default function InputForm({ onGenerate, isLoading }: InputFormProps) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);
  const extractedDataRef = useRef<{ base64: string; mediaType: string; caption?: string } | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);

  useEffect(() => {
    if (!isLoading) { setLoadingPhase(0); return; }
    setLoadingPhase(0);
    const t1 = setTimeout(() => setLoadingPhase(1), 3000);
    const t2 = setTimeout(() => setLoadingPhase(2), 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isLoading]);

  const loadingMessages = [
    "Analyzing your photo...",
    "Building your lesson plan...",
    "Adding finishing touches...",
  ];

  function compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const MAX_DIM = 1024;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          const scale = MAX_DIM / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.8
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to load image"));
      };
      img.src = objectUrl;
    });
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    extractedDataRef.current = null;

    try {
      const compressed = await compressImage(file);
      fileRef.current = compressed;
      setHasImage(true);
      const objectUrl = URL.createObjectURL(compressed);
      setPreview(objectUrl);
    } catch {
      fileRef.current = file;
      setHasImage(true);
      setPreview(URL.createObjectURL(file));
    }
  }

  async function handleExtractUrl() {
    if (!url.trim()) return;
    setExtracting(true);
    setError(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to extract image");
        setMode("upload");
        return;
      }

      setPreview(`data:${data.mediaType};base64,${data.base64}`);
      extractedDataRef.current = { base64: data.base64, mediaType: data.mediaType, caption: data.caption || undefined };
      fileRef.current = null;
      setHasImage(true);
    } catch {
      setError("Failed to extract image from URL");
    } finally {
      setExtracting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // If in URL mode with a URL but no extracted image yet, extract first then generate
    if (mode === "url" && url.trim() && !extractedDataRef.current) {
      setExtracting(true);
      setError(null);
      try {
        const res = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url.trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to extract image from that URL. Try uploading a photo instead.");
          setExtracting(false);
          return;
        }
        setPreview(`data:${data.mediaType};base64,${data.base64}`);
        extractedDataRef.current = { base64: data.base64, mediaType: data.mediaType, caption: data.caption || undefined };
        fileRef.current = null;
        setHasImage(true);
      } catch {
        setError("Failed to extract image from URL. Try uploading a photo instead.");
        setExtracting(false);
        return;
      } finally {
        setExtracting(false);
      }
    }

    if (!hasImage && !extractedDataRef.current) {
      setError("Please provide an image first");
      return;
    }
    onGenerate({
      file: fileRef.current || undefined,
      imageBase64: extractedDataRef.current?.base64,
      mediaType: extractedDataRef.current?.mediaType,
      sourceUrl: url || undefined,
      notes: notes || undefined,
      caption: extractedDataRef.current?.caption,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => { setMode("upload"); setError(null); }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            mode === "upload"
              ? "bg-white text-gray-900 shadow"
              : "text-gray-500"
          }`}
        >
          Upload Photo
        </button>
        <button
          type="button"
          onClick={() => { setMode("url"); setError(null); }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            mode === "url"
              ? "bg-white text-gray-900 shadow"
              : "text-gray-500"
          }`}
        >
          Paste URL
        </button>
      </div>

      {/* Upload Mode */}
      {mode === "upload" && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-crayon-red hover:bg-amber-50"
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-64 rounded-lg object-contain"
            />
          ) : (
            <div>
              <div className="text-4xl mb-2">📸</div>
              <p className="text-gray-600 font-medium">
                Tap to take a photo or choose from camera roll
              </p>
              <p className="text-gray-500 text-sm mt-1">
                JPG, PNG, or WebP
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* URL Mode */}
      {mode === "url" && (
        <div className="space-y-3">
          <input
            type="text"
            inputMode="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(null); }}
            placeholder="Paste Instagram, Pinterest, or TikTok URL..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-crayon-red focus:outline-none focus:ring-1 focus:ring-crayon-red"
          />
          {preview && (
            <img
              src={preview}
              alt="Extracted preview"
              className="mx-auto max-h-64 rounded-lg object-contain"
            />
          )}
        </div>
      )}

      {/* Notes */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional: e.g., 'We only have washable markers' or 'Make it easier for 4-year-olds'"
        rows={2}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-crayon-red focus:outline-none focus:ring-1 focus:ring-crayon-red resize-none"
      />

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || extracting || (!hasImage && !(mode === "url" && url.trim()))}
        className="w-full rounded-xl bg-crayon-red py-4 text-lg font-bold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {extracting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Extracting image...
          </span>
        ) : isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            {loadingMessages[loadingPhase]}
          </span>
        ) : (
          "Generate Lesson Plan"
        )}
      </button>
    </form>
  );
}
