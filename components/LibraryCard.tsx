"use client";

import Link from "next/link";

const MESS_EMOJI: Record<string, string> = {
  low: "🟢",
  medium: "🟡",
  high: "🔴",
};

interface LibraryCardProps {
  id: string;
  title: string;
  overview: string | null;
  messLevel: string | null;
  tags: string | null;
  createdAt: string;
  imageBase64?: string | null;
  onDelete?: () => void;
}

export default function LibraryCard({
  id,
  title,
  overview,
  messLevel,
  tags,
  createdAt,
  imageBase64,
  onDelete,
}: LibraryCardProps) {
  const tagList = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const date = new Date(createdAt).toLocaleDateString();

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden transition hover:shadow-md">
      {imageBase64 && (
        <div className="h-32 bg-gray-100">
          <img
            src={imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <Link href={`/plan/${id}`} className="block flex-1">
            <h3 className="font-semibold text-gray-900 hover:text-orange-600 transition">
              {title}
            </h3>
          </Link>
          {messLevel && (
            <span className="text-xs ml-2">
              {MESS_EMOJI[messLevel] || "🟡"}
            </span>
          )}
        </div>
        {overview && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{overview}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {tagList.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
        <div className="mt-3 flex gap-2">
          <Link
            href={`/plan/${id}`}
            className="flex-1 rounded-lg bg-orange-50 py-2 text-center text-xs font-medium text-orange-600 transition hover:bg-orange-100"
          >
            View
          </Link>
          {onDelete && (
            <button
              onClick={onDelete}
              className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-100"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
