"use client";

import { amazonSearchUrl, amazonBulkSearchUrl } from "@/lib/affiliate";

interface SupplyListProps {
  materials: { item: string; quantity: string; estimated_cost: string; tip?: string }[];
  totalCost: string;
  classSize?: number;
}

/** Parse "$3.50" or "~$5" to a number, returns 0 on failure */
function parseCost(cost: string): number {
  const match = cost.match(/\$?([\d.]+)/);
  return match ? parseFloat(match[1]) || 0 : 0;
}

export default function SupplyList({ materials, totalCost, classSize }: SupplyListProps) {
  const perStudentTotal = parseCost(totalCost);
  const classCost = classSize && classSize > 1 && perStudentTotal > 0
    ? (perStudentTotal * classSize).toFixed(2)
    : null;

  return (
    <div className="rounded-lg border border-gray-200">
      <div className="divide-y divide-gray-100">
        {materials.map((mat, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="checkbox"
                className="h-4 w-4 shrink-0 rounded border-gray-300 text-crayon-red focus:ring-crayon-red"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-800">{mat.item}</span>
                  <a
                    href={amazonSearchUrl(mat.item, "supply-list")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 transition hover:bg-amber-200"
                  >
                    Buy
                  </a>
                </div>
                {mat.tip && (
                  <p className="text-xs text-gray-500">{mat.tip}</p>
                )}
              </div>
            </div>
            <div className="flex gap-4 text-xs text-gray-600 shrink-0">
              <span>{mat.quantity}</span>
              <span className="w-12 text-right">{mat.estimated_cost}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            Estimated Total
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900">{totalCost}</span>
            <a
              href={amazonBulkSearchUrl(materials, "shop-all-button")}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[#FF9900] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#e88b00]"
            >
              Shop All on Amazon
            </a>
          </div>
        </div>
        {classCost && (
          <p className="mt-1 text-xs text-gray-500">
            For {classSize} students: ~${classCost}
          </p>
        )}
      </div>
      <p className="px-4 py-1.5 text-[10px] text-gray-400">
        As an Amazon Associate, ArtSpark earns from qualifying purchases.
      </p>
    </div>
  );
}
