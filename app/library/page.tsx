"use client";

import { useState, useEffect } from "react";
import LibraryCard from "@/components/LibraryCard";

interface PlanSummary {
  id: string;
  title: string;
  overview: string | null;
  mess_level: string | null;
  tags: string | null;
  created_at: string;
  source_image_base64: string | null;
}

export default function LibraryPage() {
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [search, setSearch] = useState("");
  const [messFilter, setMessFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  async function fetchPlans(query: string) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);

    const res = await fetch(`/api/plans?${params}`);
    if (res.ok) {
      const data = await res.json();
      setPlans(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    let isActive = true;

    async function loadPlans() {
      const params = new URLSearchParams();
      if (search) params.set("q", search);

      const res = await fetch(`/api/plans?${params}`);
      if (!isActive) return;

      if (res.ok) {
        const data = await res.json();
        if (isActive) {
          setPlans(data);
        }
      }

      if (isActive) {
        setLoading(false);
      }
    }

    void loadPlans();

    return () => {
      isActive = false;
    };
  }, [search]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this lesson plan?")) return;
    await fetch(`/api/plans?id=${id}`, { method: "DELETE" });
    setLoading(true);
    await fetchPlans(search);
  }

  const filtered =
    messFilter === "all"
      ? plans
      : plans.filter((p) => p.mess_level === messFilter);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Lesson Library</h1>

      {/* Search */}
      <input
        type="search"
        value={search}
        onChange={(e) => {
          setLoading(true);
          setSearch(e.target.value);
        }}
        placeholder="Search by title, materials, or theme..."
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-crayon-red focus:outline-none focus:ring-1 focus:ring-crayon-red"
      />

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "low", "medium", "high"].map((level) => (
          <button
            key={level}
            onClick={() => setMessFilter(level)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              messFilter === level
                ? "bg-crayon-red text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {level === "all"
              ? "All"
              : `${level === "low" ? "🟢" : level === "medium" ? "🟡" : "🔴"} ${level}`}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-2">🎨</div>
          <p className="text-gray-500">No lesson plans yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Generate your first plan from the home page!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((plan) => (
            <LibraryCard
              key={plan.id}
              id={plan.id}
              title={plan.title}
              overview={plan.overview}
              messLevel={plan.mess_level}
              tags={plan.tags}
              createdAt={plan.created_at}
              imageBase64={plan.source_image_base64}
              onDelete={() => handleDelete(plan.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
