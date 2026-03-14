export async function extractImageFromUrl(
  url: string
): Promise<{ imageUrl: string | null; error?: string }> {
  try {
    // Try oEmbed / Open Graph extraction
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ArtSpark/1.0; +https://artspark.app)",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return { imageUrl: null, error: `Failed to fetch URL: ${response.status}` };
    }

    const html = await response.text();

    // Try og:image first (most reliable for social media)
    const ogMatch = html.match(
      /<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i
    ) || html.match(
      /<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i
    );
    if (ogMatch) {
      return { imageUrl: ogMatch[1] };
    }

    // Try twitter:image
    const twitterMatch = html.match(
      /<meta\s+(?:property|name)=["']twitter:image["']\s+content=["']([^"']+)["']/i
    ) || html.match(
      /<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']twitter:image["']/i
    );
    if (twitterMatch) {
      return { imageUrl: twitterMatch[1] };
    }

    // Fallback: look for large images in the page
    const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*/gi);
    for (const match of imgMatches) {
      const src = match[1];
      if (
        src.includes("thumbnail") ||
        src.includes("preview") ||
        src.includes("post") ||
        (src.match(/\.(jpg|jpeg|png|webp)/i) && !src.includes("icon") && !src.includes("logo"))
      ) {
        // Resolve relative URLs
        const resolved = src.startsWith("http") ? src : new URL(src, url).href;
        return { imageUrl: resolved };
      }
    }

    return { imageUrl: null, error: "No image found at this URL" };
  } catch (err) {
    return {
      imageUrl: null,
      error: `Failed to extract image: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}

export async function fetchImageAsBase64(
  imageUrl: string
): Promise<{ base64: string; mediaType: string } | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return { base64, mediaType: contentType.split(";")[0] };
  } catch {
    return null;
  }
}
