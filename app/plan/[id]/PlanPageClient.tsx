"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LessonPlan from "@/components/LessonPlan";
import PrintView from "@/components/PrintView";
import CarouselPreview from "@/components/CarouselPreview";
import type { LessonPlanData } from "@/lib/claude";
import { generateInstagramCaption, generateCarouselSlides } from "@/lib/social";
import { safeJsonParse } from "@/lib/safe-json";

export default function PlanPageClient({ id }: { id: string }) {
  const [plan, setPlan] = useState<LessonPlanData | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | undefined>();
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPrint, setShowPrint] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/plans?id=${id}`);
      if (!res.ok) {
        setError("Plan not found");
        setLoading(false);
        return;
      }
      const data = await res.json();
      const result = safeJsonParse<LessonPlanData>(data.plan_json);
      if (!result.ok) {
        setError("Could not load plan data");
        setLoading(false);
        return;
      }
      setPlan(result.data);
      setSourceUrl(data.source_url || undefined);
      if (data.source_image_base64) {
        setImagePreview(
          data.source_image_base64.startsWith("data:")
            ? data.source_image_base64
            : `data:image/jpeg;base64,${data.source_image_base64}`
        );
      }
      setLoading(false);
    }
    load();
  }, [id]);

  function trackEvent(event: string) {
    fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: id, event }),
    }).catch(() => {});
  }

  function handlePrint() {
    trackEvent("print");
    setShowPrint(true);
    setTimeout(() => window.print(), 200);
    setTimeout(() => setShowPrint(false), 1000);
  }

  async function handleCopyCaption() {
    if (!plan) return;
    const planUrl = `${window.location.origin}/plan/${id}`;
    const caption = generateInstagramCaption(plan, planUrl);
    try {
      await navigator.clipboard.writeText(caption);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = caption;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    trackEvent("copy_caption");
    setCaptionCopied(true);
    setTimeout(() => setCaptionCopied(false), 2000);
  }

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading...</div>;
  }

  if (error || !plan) {
    return (
      <div className="py-12 text-center text-red-500">
        {error || "Plan not found"}
      </div>
    );
  }

  if (showPrint) {
    return <PrintView plan={plan} sourceUrl={sourceUrl} planId={id} />;
  }

  const planUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/plan/${id}`
      : `/plan/${id}`;

  const caption = generateInstagramCaption(plan, planUrl);
  const captionLines = caption.split("\n");
  const captionPreview = captionLines.slice(0, 3).join("\n");
  const slides = generateCarouselSlides(plan, planUrl);

  return (
    <div className="space-y-4">
      <Link
        href="/library"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 transition hover:text-gray-900"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
        </svg>
        Back to Library
      </Link>

      <LessonPlan
        plan={plan}
        sourceUrl={sourceUrl}
        imagePreview={imagePreview}
        onPrint={handlePrint}
        planId={id}
      />

      {/* Ready to Post — Instagram Package */}
      <section className="rounded-[28px] border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-5 space-y-4">
        <h3
          className="text-lg font-bold text-gray-900"
          style={{ fontFamily: "marker felt, comic sans ms, cursive" }}
        >
          Ready to Post
        </h3>

        {/* Caption Preview + Copy */}
        <div className="space-y-2">
          <div
            className="cursor-pointer rounded-xl bg-white/80 p-3 text-sm text-gray-700 leading-relaxed"
            onClick={() => setShowFullCaption(!showFullCaption)}
          >
            <pre className="whitespace-pre-wrap font-sans">
              {showFullCaption ? caption : captionPreview + "\n..."}
            </pre>
            <button className="mt-1 text-xs font-medium text-purple-600">
              {showFullCaption ? "Show less" : "Show full caption"}
            </button>
          </div>
          <button
            onClick={handleCopyCaption}
            className={`w-full rounded-xl py-2.5 text-sm font-bold transition ${
              captionCopied
                ? "bg-green-500 text-white"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            {captionCopied ? "Copied!" : "Copy Caption"}
          </button>
        </div>

        {/* Carousel Preview + Download */}
        <CarouselPreview
          slides={slides}
          planId={id}
          onDownload={() => trackEvent("download_carousel")}
        />

        {/* Post tip */}
        <p className="text-center text-xs text-gray-500">
          Tip: Post carousel + paste caption. First 3 lines are your hook — they decide if people read more.
        </p>
      </section>

      {/* Other sharing options */}
      <div className="flex items-center justify-center gap-3">
        <a
          href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(planUrl)}&description=${encodeURIComponent(`${plan.title} — Free art lesson plan for kids ages 4-6. 60 min, ${plan.mess_level} mess, ${plan.total_estimated_cost}. Full instructions + shopping list.`)}&media=${encodeURIComponent(`${planUrl.split("/plan/")[0]}/api/og/${id}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-800 transition hover:bg-red-200"
        >
          Pin It
        </a>
        <button
          onClick={handlePrint}
          className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
        >
          Print
        </button>
      </div>
    </div>
  );
}
