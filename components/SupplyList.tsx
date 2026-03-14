"use client";

interface SupplyListProps {
  materials: { item: string; quantity: string; estimated_cost: string; tip?: string }[];
  totalCost: string;
}

export default function SupplyList({ materials, totalCost }: SupplyListProps) {
  return (
    <div className="rounded-lg border border-gray-200">
      <div className="divide-y divide-gray-100">
        {materials.map((mat, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-crayon-red focus:ring-crayon-red"
              />
              <div>
                <span className="text-sm text-gray-800">{mat.item}</span>
                {mat.tip && (
                  <p className="text-xs text-gray-500">{mat.tip}</p>
                )}
              </div>
            </div>
            <div className="flex gap-4 text-xs text-gray-600">
              <span>{mat.quantity}</span>
              <span className="w-12 text-right">{mat.estimated_cost}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between border-t border-gray-200 bg-gray-50 px-4 py-2">
        <span className="text-sm font-semibold text-gray-700">
          Estimated Total
        </span>
        <span className="text-sm font-semibold text-gray-900">{totalCost}</span>
      </div>
    </div>
  );
}
