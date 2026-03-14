"use client";

import type { CarouselSlide } from "@/lib/social";

const ACCENT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "crayon-red": { bg: "bg-red-50", border: "border-crayon-red/30", text: "text-crayon-red" },
  "crayon-green": { bg: "bg-green-50", border: "border-crayon-green/30", text: "text-crayon-green" },
  "crayon-blue": { bg: "bg-blue-50", border: "border-crayon-blue/30", text: "text-crayon-blue" },
  "crayon-orange": { bg: "bg-orange-50", border: "border-crayon-orange/30", text: "text-crayon-orange" },
  "crayon-pink": { bg: "bg-pink-50", border: "border-crayon-pink/30", text: "text-crayon-pink" },
};

export default function CarouselPreview({ slides }: { slides: CarouselSlide[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3
          className="text-lg font-bold text-gray-900"
          style={{ fontFamily: "marker felt, comic sans ms, cursive" }}
        >
          Instagram Carousel
        </h3>
        <span className="text-xs text-gray-400">{slides.length} slides — screenshot to post</span>
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
        Swipe to preview all slides. Screenshot each one for Instagram.
      </p>
    </div>
  );
}
