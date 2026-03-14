"use client";

import { useState, useEffect } from "react";

interface Recommendation {
  title: string;
  overview: string;
  technique: string;
  mess_level: string;
  estimated_cost: string;
  reason: string;
  materials_needed: string[];
  seasonal_tie: string | null;
}

const MESS_EMOJI: Record<string, string> = {
  low: "✨",
  medium: "🎨",
  high: "🌈",
};

export default function Recommendations({
  onSelect,
}: {
  onSelect: (title: string, overview: string) => void;
}) {
  const [recs, setRecs] = useState<Recommendation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only fetch if user has used the app before (check localStorage)
    const hasUsed = localStorage.getItem("artspark_has_saved");
    if (!hasUsed) return;

    setLoading(true);
    fetch("/api/recommend")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        if (data.recommendations?.length) {
          setRecs(data.recommendations);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (dismissed || error || (!loading && !recs)) return null;

  if (loading) {
    return (
      <section className="rounded-[28px] border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-purple-600">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
          Finding plans you&apos;ll love...
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2
          className="text-lg font-bold text-purple-900"
          style={{ fontFamily: "marker felt, comic sans ms, cursive" }}
        >
          For You
        </h2>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-purple-400 hover:text-purple-600"
        >
          dismiss
        </button>
      </div>
      <p className="mb-4 text-xs text-purple-600">
        Based on your saved plans — no photo needed, just tap to generate.
      </p>
      <div className="space-y-3">
        {recs!.map((rec, i) => (
          <button
            key={i}
            onClick={() => onSelect(rec.title, rec.overview)}
            className="w-full rounded-2xl bg-white/80 p-4 text-left transition hover:bg-white hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {rec.title}
              </h3>
              <span className="shrink-0 text-xs text-gray-500">
                {MESS_EMOJI[rec.mess_level] || "🎨"} {rec.estimated_cost}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-600 leading-relaxed">
              {rec.overview}
            </p>
            <p className="mt-2 text-xs italic text-purple-500">
              {rec.reason}
            </p>
            {rec.seasonal_tie && (
              <span className="mt-2 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                {rec.seasonal_tie}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
