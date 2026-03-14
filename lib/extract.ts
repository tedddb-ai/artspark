const BROWSER_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

function isInstagramUrl(url: string): boolean {
  return /instagram\.com\/(p|reel|reels|tv)\//i.test(url);
}

function normalizeInstagramUrl(url: string): string {
  // Clean tracking params, ensure trailing slash
  const u = new URL(url);
  u.search = "";
  let path = u.pathname;
  if (!path.endsWith("/")) path += "/";
  return `https://www.instagram.com${path}`;
}

async function extractFromInstagram(
  url: string
): Promise<{ imageUrl: string | null; error?: string }> {
  const cleanUrl = normalizeInstagramUrl(url);

  // Strategy 1: Instagram oEmbed endpoint (works for public posts & reels)
  try {
    const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(cleanUrl)}&maxwidth=1080`;
    const res = await fetch(oembedUrl, {
      headers: { "User-Agent": BROWSER_UA },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.thumbnail_url) {
        return { imageUrl: data.thumbnail_url };
      }
    }
  } catch {
    // oEmbed failed, try next strategy
  }

  // Strategy 2: Fetch page with mobile UA, parse og:image
  try {
    const res = await fetch(cleanUrl, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    if (res.ok) {
      const html = await res.text();
      const ogMatch =
        html.match(
          /<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i
        ) ||
        html.match(
          /<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i
        );
      if (ogMatch) {
        return { imageUrl: ogMatch[1] };
      }
    }
  } catch {
    // Page fetch failed
  }

  return {
    imageUrl: null,
    error:
      "Couldn't extract this Instagram post automatically. Take a screenshot of the post and upload it instead — works great!",
  };
}

async function extractFromGenericUrl(
  url: string
): Promise<{ imageUrl: string | null; error?: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return {
        imageUrl: null,
        error: `Failed to fetch URL: ${response.status}`,
      };
    }

    const html = await response.text();

    // og:image (most reliable)
    const ogMatch =
      html.match(
        /<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i
      );
    if (ogMatch) {
      return { imageUrl: ogMatch[1] };
    }

    // twitter:image
    const twitterMatch =
      html.match(
        /<meta\s+(?:property|name)=["']twitter:image["']\s+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']twitter:image["']/i
      );
    if (twitterMatch) {
      return { imageUrl: twitterMatch[1] };
    }

    // Fallback: large images in page
    const imgMatches = html.matchAll(
      /<img[^>]+src=["']([^"']+)["'][^>]*/gi
    );
    for (const match of imgMatches) {
      const src = match[1];
      if (
        src.match(/\.(jpg|jpeg|png|webp)/i) &&
        !src.includes("icon") &&
        !src.includes("logo") &&
        !src.includes("avatar")
      ) {
        const resolved = src.startsWith("http")
          ? src
          : new URL(src, url).href;
        return { imageUrl: resolved };
      }
    }

    return { imageUrl: null, error: "No image found at this URL. Try taking a screenshot and uploading it instead." };
  } catch (err) {
    return {
      imageUrl: null,
      error: `Failed to extract image: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}

export async function extractImageFromUrl(
  url: string
): Promise<{ imageUrl: string | null; error?: string }> {
  if (isInstagramUrl(url)) {
    return extractFromInstagram(url);
  }
  return extractFromGenericUrl(url);
}

export async function fetchImageAsBase64(
  imageUrl: string
): Promise<{ base64: string; mediaType: string } | null> {
  try {
    const response = await fetch(imageUrl, {
      headers: { "User-Agent": BROWSER_UA },
    });
    if (!response.ok) return null;

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return { base64, mediaType: contentType.split(";")[0] };
  } catch {
    return null;
  }
}
