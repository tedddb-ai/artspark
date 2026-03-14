"use client";

import { useState, useEffect } from "react";

const SUPPLY_CATEGORIES = [
  {
    name: "Paint & Color",
    items: [
      "Washable tempera paint (assorted colors)",
      "Washable watercolors",
      "Finger paint",
      "Washable markers",
      "Crayons",
      "Colored pencils",
      "Oil pastels",
      "Chalk pastels",
    ],
  },
  {
    name: "Paper & Surfaces",
    items: [
      "White cardstock",
      "Construction paper (assorted colors)",
      "Watercolor paper",
      "Paper plates",
      "Coffee filters",
      "Butcher/craft paper (rolls)",
      "Tissue paper (assorted colors)",
      "Newspaper (for covering tables)",
    ],
  },
  {
    name: "Adhesives & Tape",
    items: [
      "Glue sticks",
      "White school glue (Elmer's)",
      "Liquid glue bottles",
      "Clear tape",
      "Masking tape",
      "Washi tape",
    ],
  },
  {
    name: "Tools",
    items: [
      "Child-safe scissors",
      "Paintbrushes (assorted sizes)",
      "Foam brushes",
      "Sponges (for painting/cleanup)",
      "Hole puncher",
      "Rulers",
      "Pencils",
      "Smocks/old t-shirts",
    ],
  },
  {
    name: "Craft Supplies",
    items: [
      "Googly eyes",
      "Pom poms (assorted sizes)",
      "Pipe cleaners/chenille stems",
      "Craft sticks (popsicle sticks)",
      "Cotton balls",
      "Feathers",
      "Glitter (washable/chunky)",
      "Sequins",
      "Yarn/string",
      "Stickers",
      "Beads (large, no choking hazard)",
    ],
  },
  {
    name: "Cleanup",
    items: [
      "Paper towels",
      "Baby wipes/wet wipes",
      "Plastic tablecloths",
      "Drying rack",
      "Paint cups/water cups",
    ],
  },
];

export default function SuppliesPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [otherSupplies, setOtherSupplies] = useState("");
  const [classSize, setClassSize] = useState(15);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/supplies")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          const allKnown = SUPPLY_CATEGORIES.flatMap((c) => c.items);
          const known = new Set<string>();
          const other: string[] = [];
          for (const s of data.profile.supplies) {
            if (allKnown.includes(s)) {
              known.add(s);
            } else {
              other.push(s);
            }
          }
          setSelected(known);
          setOtherSupplies(other.join("\n"));
          setClassSize(data.profile.class_size || 15);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function toggle(item: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const otherList = otherSupplies
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const allSupplies = [...selected, ...otherList];
    try {
      await fetch("/api/supplies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplies: allSupplies, class_size: classSize }),
      });
      setSaved(true);
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-crayon-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: "marker felt, comic sans ms, cursive" }}
        >
          My Classroom Supplies
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Check what you already have. ArtSpark will use this to avoid
          suggesting things you don&apos;t need to buy.
        </p>
      </div>

      {/* Class size */}
      <div className="rounded-xl border border-amber-100 bg-white p-4">
        <label className="text-sm font-medium text-gray-700">
          Class size
        </label>
        <div className="mt-1 flex items-center gap-3">
          <input
            type="range"
            min={4}
            max={30}
            value={classSize}
            onChange={(e) => {
              setClassSize(Number(e.target.value));
              setSaved(false);
            }}
            className="flex-1 accent-crayon-orange"
          />
          <span className="w-12 text-center text-lg font-bold text-crayon-orange">
            {classSize}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Material quantities will be adjusted for your class
        </p>
      </div>

      {/* Supply categories */}
      {SUPPLY_CATEGORIES.map((cat) => (
        <div key={cat.name}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
            {cat.name}
          </h2>
          <div className="flex flex-wrap gap-2">
            {cat.items.map((item) => (
              <button
                key={item}
                onClick={() => toggle(item)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  selected.has(item)
                    ? "border-crayon-green bg-crayon-green/10 font-medium text-crayon-green"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {selected.has(item) ? "\u2713 " : ""}
                {item}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Other supplies */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Other supplies (one per line)
        </label>
        <textarea
          value={otherSupplies}
          onChange={(e) => {
            setOtherSupplies(e.target.value);
            setSaved(false);
          }}
          rows={3}
          placeholder="Foam sheets&#10;Mod Podge&#10;Air-dry clay"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-300 focus:border-crayon-orange focus:outline-none focus:ring-1 focus:ring-crayon-orange"
        />
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full rounded-xl py-3 text-center font-semibold text-white transition ${
          saved
            ? "bg-crayon-green"
            : "bg-crayon-orange hover:bg-crayon-orange/90"
        } disabled:opacity-60`}
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save My Supplies"}
      </button>

      <p className="text-center text-xs text-gray-400">
        {selected.size} supplies selected
        {otherSupplies.trim() ? ` + custom items` : ""}
      </p>
    </div>
  );
}
