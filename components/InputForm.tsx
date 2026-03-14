"use client";

import { useState, useRef } from "react";

interface InputFormProps {
  onGenerate: (data: {
    imageBase64: string;
    mediaType: string;
    sourceUrl?: string;
    notes?: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageDataRef = useRef<{ base64: string; mediaType: string } | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      const base64 = result.split(",")[1];
      imageDataRef.current = { base64, mediaType: file.type || "image/jpeg" };
    };
    reader.readAsDataURL(file);
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
        // If extraction fails, guide user to screenshot instead
        setError(data.error || "Failed to extract image");
        setMode("upload");
        return;
      }

      setPreview(`data:${data.mediaType};base64,${data.base64}`);
      imageDataRef.current = { base64: data.base64, mediaType: data.mediaType };
    } catch {
      setError("Failed to extract image from URL");
    } finally {
      setExtracting(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageDataRef.current) {
      setError("Please provide an image first");
      return;
    }
    onGenerate({
      imageBase64: imageDataRef.current.base64,
      mediaType: imageDataRef.current.mediaType,
      sourceUrl: url || undefined,
      notes: notes || undefined,
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
          className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-orange-400 hover:bg-orange-50"
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
              <p className="text-gray-400 text-sm mt-1">
                JPG, PNG, or WebP
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* URL Mode */}
      {mode === "url" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Instagram, Pinterest, or TikTok URL..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
            <button
              type="button"
              onClick={handleExtractUrl}
              disabled={extracting || !url.trim()}
              className="rounded-lg bg-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-300 disabled:opacity-50"
            >
              {extracting ? "..." : "Get"}
            </button>
          </div>
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
        placeholder="Optional: &quot;Focus on color mixing&quot; or &quot;Use only recycled materials&quot;..."
        rows={2}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 resize-none"
      />

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !imageDataRef.current}
        className="w-full rounded-xl bg-orange-500 py-4 text-lg font-bold text-white transition hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Generating Lesson Plan...
          </span>
        ) : (
          "Generate Lesson Plan"
        )}
      </button>
    </form>
  );
}
