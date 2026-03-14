"use client";

import { useState, useEffect, use } from "react";
import LessonPlan from "@/components/LessonPlan";
import PrintView from "@/components/PrintView";
import type { LessonPlanData } from "@/lib/claude";

export default function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [plan, setPlan] = useState<LessonPlanData | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | undefined>();
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/plans?id=${id}`);
      if (!res.ok) {
        setError("Plan not found");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setPlan(JSON.parse(data.plan_json));
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

  function handlePrint() {
    setShowPrint(true);
    setTimeout(() => window.print(), 200);
    setTimeout(() => setShowPrint(false), 1000);
  }

  if (loading) {
    return <div className="py-12 text-center text-gray-400">Loading...</div>;
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

  return (
    <LessonPlan
      plan={plan}
      sourceUrl={sourceUrl}
      imagePreview={imagePreview}
      onPrint={handlePrint}
    />
  );
}
