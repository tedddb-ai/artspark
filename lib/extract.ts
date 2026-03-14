const BROWSER_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

function isInstagramUrl(url: string): boolean {
  return /instagram\.com\/(p|reel|reels|tv)\//i.test(url);
}

/** Extract the shortcode and type from an Instagram URL */
function parseInstagramUrl(url: string): { type: string; shortcode: string } | null {
  const match = url.match(/instagram\.com\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i);
  if (!match) return null;
  const type = match[1].toLowerCase() === "reels" ? "reel" : match[1].toLowerCase();
  return { type, shortcode: match[2] };
}

async function extractFromInstagram(
  url: string
): Promise<{ imageUrl: string | null; error?: string }> {
  const parsed = parseInstagramUrl(url);
  if (!parsed) {
    return { imageUrl: null, error: "Could not parse Instagram URL" };
  }

  // Strategy 1: Fetch the /embed/ page — lightweight, no auth needed
  // Instagram serves a simpler HTML page for embeds that contains the image
  try {
    const embedUrl = `https://www.instagram.com/${parsed.type}/${parsed.shortcode}/embed/`;
    const res = await fetch(embedUrl, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (res.ok) {
      const html = await res.text();

      // The embed page has images in various places — try them all
      // 1. og:image meta tag
      const ogMatch =
        html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);
      if (ogMatch) {
        return { imageUrl: ogMatch[1] };
      }

      // 2. Image in the embed markup (class="EmbeddedMediaImage" or similar)
      const imgMatch =
        html.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/i) ||
        html.match(/class="[^"]*"[^>]*src="(https:\/\/[^"]*scontent[^"]*cdninstagram[^"]+)"/i) ||
        html.match(/src="(https:\/\/[^"]*cdninstagram\.com[^"]+)"/i) ||
        html.match(/src="(https:\/\/scontent[^"]+)"/i);
      if (imgMatch) {
        return { imageUrl: imgMatch[1].replace(/&amp;/g, "&") };
      }

      // 3. Background image in style attributes
      const bgMatch = html.match(/background-image:\s*url\(["']?(https:\/\/[^"')]+)["']?\)/i);
      if (bgMatch) {
        return { imageUrl: bgMatch[1].replace(/&amp;/g, "&") };
      }

      // 4. Any Instagram CDN image URL in the page
      const cdnMatch = html.match(/(https:\/\/(?:scontent|instagram)[^"'\s\\]+\.(?:jpg|jpeg|png|webp)[^"'\s\\]*)/i);
      if (cdnMatch) {
        return { imageUrl: cdnMatch[1].replace(/\\u0026/g, "&").replace(/&amp;/g, "&") };
      }
    }
  } catch (e) {
    console.error("Instagram embed fetch failed:", e);
  }

  // Strategy 2: Try the /media/ redirect endpoint (works for posts, not always reels)
  if (parsed.type === "p") {
    try {
      const mediaUrl = `https://www.instagram.com/p/${parsed.shortcode}/media/?size=l`;
      const res = await fetch(mediaUrl, {
        headers: { "User-Agent": BROWSER_UA },
        redirect: "manual",
      });
      const location = res.headers.get("location");
      if (location && location.includes("cdninstagram")) {
        return { imageUrl: location };
      }
    } catch {
      // media redirect failed
    }
  }

  // Strategy 3: Direct page fetch with mobile UA
  try {
    const cleanUrl = `https://www.instagram.com/${parsed.type}/${parsed.shortcode}/`;
    const res = await fetch(cleanUrl, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    if (res.ok) {
      const html = await res.text();
      const ogMatch =
        html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);
      if (ogMatch) {
        return { imageUrl: ogMatch[1] };
      }
    }
  } catch {
    // direct fetch failed
  }

  return {
    imageUrl: null,
    error: "Couldn't extract this Instagram post. Try screenshotting it and uploading instead.",
  };
}

async function extractFromGenericUrl(
  url: string
): Promise<{ imageUrl: string | null; error?: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return { imageUrl: null, error: `Failed to fetch URL: ${response.status}` };
    }

    const html = await response.text();

    const ogMatch =
      html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);
    if (ogMatch) return { imageUrl: ogMatch[1] };

    const twitterMatch =
      html.match(/<meta\s+(?:property|name)=["']twitter:image["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']twitter:image["']/i);
    if (twitterMatch) return { imageUrl: twitterMatch[1] };

    const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*/gi);
    for (const match of imgMatches) {
      const src = match[1];
      if (
        src.match(/\.(jpg|jpeg|png|webp)/i) &&
        !src.includes("icon") &&
        !src.includes("logo") &&
        !src.includes("avatar")
      ) {
        const resolved = src.startsWith("http") ? src : new URL(src, url).href;
        return { imageUrl: resolved };
      }
    }

    return { imageUrl: null, error: "No image found at this URL." };
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
