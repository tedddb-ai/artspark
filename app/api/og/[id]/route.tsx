import { ImageResponse } from "next/og";
import { getPlan } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let title = "ArtSpark Lesson Plan";
  let overview = "Turn art inspiration into classroom-ready lesson plans";
  let messLevel = "medium";
  let cost = "";
  let tags: string[] = [];

  try {
    const saved = await getPlan(id);
    if (saved) {
      const plan = JSON.parse(saved.plan_json);
      title = plan.title || title;
      overview = plan.overview || overview;
      messLevel = plan.mess_level || messLevel;
      cost = plan.total_estimated_cost || "";
      tags = (plan.tags || []).slice(0, 3);
    }
  } catch {
    // Fall back to defaults
  }

  const messEmoji =
    messLevel === "low" ? "✨" : messLevel === "high" ? "🌈" : "🎨";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          backgroundColor: "#FFF8E7",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "24px",
              backgroundColor: "#C1272D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            A
          </div>
          <span
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#666",
            }}
          >
            ArtSpark
          </span>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "56px",
              fontWeight: "bold",
              color: "#2D2D2D",
              lineHeight: 1.1,
              maxWidth: "900px",
            }}
          >
            {title.length > 60 ? title.slice(0, 57) + "..." : title}
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#666",
              lineHeight: 1.4,
              maxWidth: "800px",
            }}
          >
            {overview.length > 120
              ? overview.slice(0, 117) + "..."
              : overview}
          </div>
        </div>

        {/* Footer: stats + tags */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", gap: "24px", fontSize: "22px", color: "#888" }}>
            <span>{messEmoji} {messLevel} mess</span>
            <span>⏱ 60 min</span>
            {cost && <span>💰 {cost}</span>}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  backgroundColor: "#C1272D",
                  color: "white",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    }
  );
}
