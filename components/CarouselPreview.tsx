"use client";

import { useState } from "react";
import type { CarouselSlide } from "@/lib/social";

const ACCENT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "crayon-red": { bg: "bg-red-50", border: "border-crayon-red/30", text: "text-crayon-red" },
  "crayon-green": { bg: "bg-green-50", border: "border-crayon-green/30", text: "text-crayon-green" },
  "crayon-blue": { bg: "bg-blue-50", border: "border-crayon-blue/30", text: "text-crayon-blue" },
  "crayon-orange": { bg: "bg-orange-50", border: "border-crayon-orange/30", text: "text-crayon-orange" },
  "crayon-pink": { bg: "bg-pink-50", border: "border-crayon-pink/30", text: "text-crayon-pink" },
};

export default function CarouselPreview({
  slides,
  planId,
}: {
  slides: CarouselSlide[];
  planId?: string;
}) {
  const [downloading, setDownloading] = useState(false);

  async function downloadAll() {
    if (!planId || downloading) return;
    setDownloading(true);
    try {
      for (let i = 1; i <= slides.length; i++) {
        const res = await fetch(`/api/carousel/${planId}/${i}`);
        if (!res.ok) continue;
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `artspark-slide-${i}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        // Small delay between downloads so browser doesn't block them
        if (i < slides.length) await new Promise((r) => setTimeout(r, 300));
      }
    } catch {
      alert("Download failed. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3
          className="text-lg font-bold text-gray-900"
          style={{ fontFamily: "marker felt, comic sans ms, cursive" }}
        >
          Instagram Carousel
        </h3>
        {planId && (
          <button
            onClick={downloadAll}
            disabled={downloading}
            className="rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {downloading ? "Downloading..." : `Download All (${slides.length})`}
          </button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
        {slides.map((slide) => {
          const colors = ACCENT_COLORS[slide.accent || "crayon-red"] || ACCENT_COLORS["crayon-red"];
          return (
            <div
              key={slide.slideNumber}
              className={`flex-none snap-center rounded-2xl border-2 ${colors.border} ${colors.bg} p-5 w-72 min-h-72`}
              style={{ aspectRatio: "1/1" }}
            >
              {/* Slide indicator */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">
                  {slide.slideNumber}/{slide.totalSlides}
                </span>
                <span className="text-xs font-semibold text-gray-400">ArtSpark</span>
              </div>

              {/* Title */}
              <h4
                className={`text-lg font-bold ${colors.text} mb-3 leading-tight`}
                style={{ fontFamily: "marker felt, comic sans ms, cursive" }}
              >
                {slide.title}
              </h4>

              {/* Body */}
              <div className="space-y-1">
                {slide.body.map((line, i) => (
                  <p
                    key={i}
                    className={`text-sm leading-relaxed ${
                      line === "" ? "h-2" : "text-gray-700"
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400">
        {planId
          ? "Download all slides as images ready for Instagram."
          : "Save this plan first to download carousel images."}
      </p>
    </div>
  );
}
