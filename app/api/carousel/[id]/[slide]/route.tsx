import { ImageResponse } from "next/og";
import { getPlan } from "@/lib/db";
import { generateCarouselSlides } from "@/lib/social";
import type { CarouselSlide } from "@/lib/social";

const ACCENT_STYLES: Record<string, { bg: string; title: string; border: string }> = {
  "crayon-red": { bg: "#FFF5F5", title: "#C1272D", border: "#C1272D" },
  "crayon-green": { bg: "#F0FFF4", title: "#2D8B43", border: "#2D8B43" },
  "crayon-blue": { bg: "#EBF8FF", title: "#2E6DB4", border: "#2E6DB4" },
  "crayon-orange": { bg: "#FFFAF0", title: "#E67E22", border: "#E67E22" },
  "crayon-pink": { bg: "#FFF5F7", title: "#C770A8", border: "#C770A8" },
};

function renderSlide(slide: CarouselSlide) {
  const colors = ACCENT_STYLES[slide.accent || "crayon-red"] || ACCENT_STYLES["crayon-red"];

  return (
    <div
      style={{
        width: "1080px",
        height: "1080px",
        display: "flex",
        flexDirection: "column",
        padding: "72px",
        backgroundColor: colors.bg,
        fontFamily: "system-ui, sans-serif",
        borderLeft: `8px solid ${colors.border}`,
      }}
    >
      {/* Header: slide number + branding */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "36px",
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          {Array.from({ length: slide.totalSlides }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === slide.slideNumber - 1 ? "24px" : "10px",
                height: "10px",
                borderRadius: "5px",
                backgroundColor:
                  i === slide.slideNumber - 1 ? colors.title : "#D1D5DB",
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "14px",
              backgroundColor: "#C1272D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            A
          </div>
          <span style={{ fontSize: "18px", fontWeight: "600", color: "#9CA3AF" }}>
            ArtSpark
          </span>
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: slide.slideNumber === 1 ? "54px" : "44px",
          fontWeight: "bold",
          color: colors.title,
          lineHeight: 1.2,
          marginBottom: "32px",
        }}
      >
        {slide.title}
      </div>

      {/* Body */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          flex: 1,
        }}
      >
        {slide.body.map((line, i) => (
          <div
            key={i}
            style={{
              fontSize: line === "" ? "8px" : "26px",
              lineHeight: 1.5,
              color: line === "" ? "transparent" : "#374151",
            }}
          >
            {line || " "}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          fontSize: "16px",
          color: "#9CA3AF",
          textAlign: "center",
          marginTop: "24px",
        }}
      >
        artspark-alpha.vercel.app
      </div>
    </div>
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; slide: string }> }
) {
  const { id, slide: slideStr } = await params;
  const slideNum = parseInt(slideStr, 10);

  try {
    const saved = await getPlan(id);
    if (!saved) {
      return new Response("Plan not found", { status: 404 });
    }

    const plan = JSON.parse(saved.plan_json);
    const planUrl = `https://artspark-alpha.vercel.app/plan/${id}`;
    const slides = generateCarouselSlides(plan, planUrl);

    if (slideNum < 1 || slideNum > slides.length) {
      return new Response(`Slide ${slideNum} not found (1-${slides.length})`, {
        status: 404,
      });
    }

    return new ImageResponse(renderSlide(slides[slideNum - 1]), {
      width: 1080,
      height: 1080,
    });
  } catch (error) {
    console.error("Carousel image error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
