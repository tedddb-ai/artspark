"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import InputForm from "@/components/InputForm";
import LessonPlan from "@/components/LessonPlan";
import type { LessonPlanData } from "@/lib/claude";

interface GeneratePayload {
  imageBase64: string;
  mediaType: string;
  sourceUrl?: string;
  notes?: string;
}

interface GeneratedResult {
  plan: LessonPlanData;
  imageBase64: string;
  mediaType: string;
}

export default function Home() {
  const router = useRouter();
  const [generated, setGenerated] = useState<GeneratedResult | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishStatus, setPolishStatus] = useState<"idle" | "polishing" | "done" | "failed">("idle");
  const [isSaving, setIsSaving] = useState(false);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(input: GeneratePayload) {
    setIsGenerating(true);
    setError(null);
    setSavedPlanId(null);
    setPolishStatus("idle");

    try {
      const formData = new FormData();
      formData.set("imageBase64", input.imageBase64);
      formData.set("mediaType", input.mediaType);
      if (input.notes) formData.set("notes", input.notes);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate lesson plan");
      }

      const result: GeneratedResult = {
        plan: data.plan,
        imageBase64: data.imageBase64,
        mediaType: data.mediaType,
      };
      setGenerated(result);
      setSourceUrl(input.sourceUrl);

      // Auto-fire Opus polish in background
      polishPlan(result);
    } catch (err) {
      setGenerated(null);
      setError(
        err instanceof Error ? err.message : "Failed to generate lesson plan"
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function polishPlan(result: GeneratedResult) {
    setIsPolishing(true);
    setPolishStatus("polishing");

    try {
      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: result.plan }),
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Polish failed:", data.error);
        setPolishStatus("failed");
        return;
      }

      setGenerated((prev) =>
        prev ? { ...prev, plan: data.plan } : null
      );
      setPolishStatus("done");
    } catch {
      setPolishStatus("failed");
    } finally {
      setIsPolishing(false);
    }
  }

  async function handleSave() {
    if (!generated || isSaving) return;

    setIsSaving(true);
    setError(null);

    const id = uuidv4();

    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title: generated.plan.title,
          overview: generated.plan.overview,
          plan_json: JSON.stringify(generated.plan),
          source_url: sourceUrl,
          source_image_base64: generated.imageBase64,
          mess_level: generated.plan.mess_level,
          tags: generated.plan.tags.join(", "),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save lesson plan");
      }

      setSavedPlanId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save lesson plan");
    } finally {
      setIsSaving(false);
    }
  }

  function handleOpenSavedPlan() {
    if (!savedPlanId) return;
    router.push(`/plan/${savedPlanId}`);
  }

  return (
    <div className="space-y-6 pb-10">
      <section className="space-y-4 rounded-[28px] bg-gradient-to-br from-orange-100 via-amber-50 to-white p-5 shadow-sm ring-1 ring-orange-100">
        <div className="inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
          Mobile-first lesson planning
        </div>
        <div className="space-y-3">
          <h1 className="max-w-sm text-4xl font-semibold tracking-tight text-gray-950">
            Turn art inspiration into a teachable plan for ages 4-6.
          </h1>
          <p className="max-w-md text-sm leading-6 text-gray-600">
            Paste an inspiration URL or upload a photo. ArtSpark extracts the
            idea, generates a structured 60-minute lesson, and saves it to your
            classroom library.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
          <div className="rounded-2xl bg-white px-3 py-3">
            <div className="text-lg font-semibold text-gray-900">1</div>
            Add photo or URL
          </div>
          <div className="rounded-2xl bg-white px-3 py-3">
            <div className="text-lg font-semibold text-gray-900">2</div>
            Review lesson plan
          </div>
          <div className="rounded-2xl bg-white px-3 py-3">
            <div className="text-lg font-semibold text-gray-900">3</div>
            Save to library
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Start with inspiration
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Works with uploaded images or social post URLs that expose a usable
            preview image.
          </p>
        </div>

        <InputForm onGenerate={handleGenerate} isLoading={isGenerating} />

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </section>

      {generated ? (
        <section className="space-y-4 rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Generated lesson plan
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Review the plan, then save it for later or print it from the
                full plan view.
              </p>
            </div>
            <Link
              href="/library"
              className="shrink-0 rounded-full bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
            >
              Open Library
            </Link>
          </div>

          {/* Polish status banner */}
          {polishStatus === "polishing" && (
            <div className="rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700 flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
              Opus is enhancing your lesson plan...
            </div>
          )}
          {polishStatus === "done" && (
            <div className="rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700">
              Enhanced by Opus — instructions sharpened, safety notes refined, costs verified.
            </div>
          )}
          {polishStatus === "failed" && (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
              Enhancement unavailable — showing Sonnet draft (still great!).
            </div>
          )}

          {savedPlanId ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Lesson plan saved.{" "}
              <button
                type="button"
                onClick={handleOpenSavedPlan}
                className="font-semibold underline decoration-green-400 underline-offset-2"
              >
                Open saved plan
              </button>
            </div>
          ) : null}

          <LessonPlan
            plan={generated.plan}
            sourceUrl={sourceUrl}
            imagePreview={`data:${generated.mediaType};base64,${generated.imageBase64}`}
            onSave={handleSave}
            isSaved={Boolean(savedPlanId) || isSaving}
          />
        </section>
      ) : (
        <section className="rounded-[28px] border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <p className="text-sm font-medium text-gray-700">
            Your generated lesson plan will appear here.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Start from a camera photo, a Pinterest pin, or another inspiration
            image URL.
          </p>
        </section>
      )}
    </div>
  );
}
